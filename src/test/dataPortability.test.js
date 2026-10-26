import { describe, expect, it } from 'vitest'
import {
  BACKUP_SCHEMA_VERSION,
  MAX_BACKUP_BYTES,
  applyPlan,
  buildBackup,
  exportProblemsCsv,
  parseBackupText,
  planImport,
  validateBackup,
  validateBackupFileMetadata,
} from '../utils/dataPortability'

function problem(id, overrides = {}) {
  return {
    id,
    title: `Problem ${id}`,
    platform: 'LeetCode',
    url: `https://leetcode.com/problems/${id}`,
    difficulty: 'Medium',
    topics: ['Arrays'],
    status: 'Solved',
    solvedDate: '2026-10-25',
    timeTakenMinutes: 20,
    notes: '',
    revision: {
      marked: false,
      priority: 'Medium',
      stage: 0,
      nextRevisionDate: null,
      revisionCount: 0,
      addedAt: null,
      updatedAt: null,
      lastRevisedDate: null,
      scheduleRepaired: false,
    },
    createdAt: '2026-10-20T00:00:00.000Z',
    updatedAt: '2026-10-25T00:00:00.000Z',
    isSample: false,
    ...overrides,
  }
}

function current(overrides = {}) {
  return {
    problems: [],
    revisionHistory: [],
    settings: {
      displayName: 'Developer', theme: 'dark', accent: 'indigo', dailyGoal: 3,
      revisionIntervals: [1, 3, 7, 14, 30], pageSize: 25,
      reduceMotion: false, confetti: true, onboardingCompleted: false, usingSampleData: false,
    },
    recentSearches: [],
    ...overrides,
  }
}

describe('DevTrack data portability', () => {
  it('builds a versioned normalized backup with recomputed counts and no auth data', () => {
    const source = current({ problems: [problem('one')] })
    const backup = buildBackup({ ...source, demoAuth: { email: 'private@example.com' } }, { exportedAt: new Date('2026-10-25T12:00:00Z') })
    expect(backup).toMatchObject({ app: 'DevTrack', schemaVersion: BACKUP_SCHEMA_VERSION, counts: { problems: 1 } })
    expect(backup.exportedAt).toBe('2026-10-25T12:00:00.000Z')
    expect(backup.data).not.toHaveProperty('demoAuth')
    expect(validateBackup(backup).isValid).toBe(true)
  })

  it('supports an empty backup and header-only CSV', () => {
    const backup = buildBackup(current())
    expect(validateBackup(backup).isValid).toBe(true)
    expect(backup.counts).toMatchObject({ problems: 0, revisionQueue: 0, revisionHistory: 0 })
    expect(exportProblemsCsv([])).toBe('\uFEFFTitle,Platform,Topic,Difficulty,Status,URL,Date Solved,Notes,Marked For Revision\r\n')
  })

  it('rejects malformed JSON, the wrong app, and newer schema versions', () => {
    expect(parseBackupText('{broken').errors[0]).toMatch(/malformed JSON/)
    const wrongApp = buildBackup(current())
    wrongApp.app = 'Other'
    expect(validateBackup(wrongApp).errors).toContain('This file is not a DevTrack backup.')
    const newer = buildBackup(current())
    newer.schemaVersion = BACKUP_SCHEMA_VERSION + 1
    expect(validateBackup(newer).errors).toContain('This backup was created by a newer version of DevTrack.')
  })

  it('rejects oversize or non-JSON file metadata', () => {
    expect(validateBackupFileMetadata({ name: 'backup.json', type: 'application/json', size: MAX_BACKUP_BYTES }).isValid).toBe(true)
    expect(validateBackupFileMetadata({ name: 'backup.txt', type: 'text/plain', size: 12 }).isValid).toBe(false)
    expect(validateBackupFileMetadata({ name: 'backup.json', type: 'application/json', size: MAX_BACKUP_BYTES + 1 }).errors[0]).toMatch(/5 MB/)
  })

  it('collects duplicate ids, invalid references, enum, URL, date, and goal errors', () => {
    const backup = buildBackup(current({ problems: [problem('duplicate'), problem('second')] }))
    backup.data.problems[1].id = 'duplicate'
    backup.data.problems[0].difficulty = 'Extreme'
    backup.data.problems[0].url = 'javascript:alert(1)'
    backup.data.problems[0].solvedDate = '2026-02-30'
    backup.data.revisionQueue.push({
      problemId: 'missing', marked: true, priority: 'Medium', stage: 0,
      nextRevisionDate: '2026-10-26', revisionCount: 0,
      addedAt: '2026-10-25T00:00:00Z', updatedAt: '2026-10-25T00:00:00Z',
      lastRevisedDate: null, scheduleRepaired: false,
    })
    backup.data.dailyGoal = 0
    const result = validateBackup(backup)
    expect(result.isValid).toBe(false)
    expect(result.errors.join(' ')).toMatch(/Duplicate problem id/)
    expect(result.errors.join(' ')).toMatch(/invalid difficulty/)
    expect(result.errors.join(' ')).toMatch(/URL must use http or https/)
    expect(result.errors.join(' ')).toMatch(/valid solvedDate/)
    expect(result.errors.join(' ')).toMatch(/references missing problem/)
    expect(result.errors.join(' ')).toMatch(/dailyGoal/)
  })

  it('rejects type-coerced fields and a queue that disagrees with its problem', () => {
    const backup = buildBackup(current({ problems: [problem('typed')] }))
    backup.data.problems[0].timeTakenMinutes = '20'
    backup.data.problems[0].revision.marked = 'false'
    backup.data.problems[0].revision.stage = '0'
    backup.data.preferences.reduceMotion = 'false'
    backup.data.preferences.pageSize = '25'
    const typed = validateBackup(backup)
    expect(typed.isValid).toBe(false)
    expect(typed.errors.join(' ')).toMatch(/timeTakenMinutes must be a number or null/)
    expect(typed.errors.join(' ')).toMatch(/marked must be true or false/)
    expect(typed.errors.join(' ')).toMatch(/stage must be an integer/)
    expect(typed.errors.join(' ')).toMatch(/preferences.reduceMotion must be true or false/)
    expect(typed.errors.join(' ')).toMatch(/preferences.pageSize must be a number/)

    const inconsistent = buildBackup(current({ problems: [problem('queue')] }))
    inconsistent.data.revisionQueue.push({
      problemId: 'queue', marked: true, priority: 'Medium', stage: 0,
      nextRevisionDate: null, revisionCount: 0, addedAt: null, updatedAt: null,
      lastRevisedDate: null, scheduleRepaired: false,
    })
    const queueResult = validateBackup(inconsistent)
    expect(queueResult.isValid).toBe(false)
    expect(queueResult.errors.join(' ')).toMatch(/Unmarked problem queue cannot appear in revisionQueue/)
  })

  it('recomputes untrusted count metadata and reports a warning', () => {
    const backup = buildBackup(current({ problems: [problem('counted')] }))
    backup.counts.problems = 999
    const result = validateBackup(backup)
    expect(result.isValid).toBe(true)
    expect(result.backup.counts.problems).toBe(1)
    expect(result.warnings.join(' ')).toMatch(/counts did not match/)
  })

  it('allows deleted-problem history only when a snapshot title is retained', () => {
    const backup = buildBackup(current())
    backup.data.revisionHistory = [{
      id: 'history-1', problemId: 'deleted', snapshotTitle: 'Deleted title',
      revisedAt: '2026-10-25T00:00:00.000Z', previousDueDate: '2026-10-25',
      nextScheduledDate: null, stage: 1, migratedFromLegacy: false,
    }]
    expect(validateBackup(backup).isValid).toBe(true)
    backup.data.revisionHistory[0].snapshotTitle = ''
    expect(validateBackup(backup).errors.join(' ')).toMatch(/without snapshotTitle/)
  })

  it('drops unknown and prototype-related fields through explicit whitelisting', () => {
    const backup = buildBackup(current({ problems: [problem('safe')] }))
    backup.data.problems[0].unknown = 'drop me'
    const parsed = JSON.parse(JSON.stringify(backup).replace('"unknown":"drop me"', '"unknown":"drop me","__proto__":{"polluted":true}'))
    const result = validateBackup(parsed)
    expect(result.isValid).toBe(true)
    expect(result.droppedFieldCount).toBeGreaterThan(0)
    expect(result.backup.data.problems[0]).not.toHaveProperty('unknown')
    expect({}).not.toHaveProperty('polluted')
  })

  it('merges deterministically, preserves settings by default, and is idempotent', () => {
    const existing = current({
      problems: [problem('shared', { title: 'Old', updatedAt: '2026-10-20T00:00:00Z' }), problem('existing')],
      settings: { ...current().settings, theme: 'dark', dailyGoal: 3 },
    })
    const incomingSource = current({
      problems: [problem('shared', { title: 'New', updatedAt: '2026-10-26T00:00:00Z' }), problem('incoming')],
      settings: { ...current().settings, theme: 'light', dailyGoal: 9 },
    })
    const validated = validateBackup(buildBackup(incomingSource)).backup
    const plan = planImport(existing, validated, { mode: 'merge' })
    expect(plan.next.problems.map((item) => item.id)).toEqual(['shared', 'existing', 'incoming'])
    expect(plan.next.problems[0].title).toBe('New')
    expect(plan.next.settings).toMatchObject({ theme: 'dark', dailyGoal: 3 })
    expect(plan.preview).toMatchObject({ addedProblems: 1, updatedProblems: 1, conflicts: 1 })

    const second = planImport(applyPlan(plan), validated, { mode: 'merge' })
    expect(second.preview).toMatchObject({ addedProblems: 0, updatedProblems: 0 })
    expect(applyPlan(second)).toEqual(applyPlan(plan))
  })

  it('can opt into imported preferences during merge', () => {
    const incoming = validateBackup(buildBackup(current({ settings: { ...current().settings, theme: 'light', dailyGoal: 12 } }))).backup
    const plan = planImport(current(), incoming, { mode: 'merge', takePreferences: true })
    expect(plan.next.settings).toMatchObject({ theme: 'light', dailyGoal: 12 })
  })

  it('replace mode removes current-only records and uses imported preferences', () => {
    const existing = current({ problems: [problem('old')] })
    const incoming = validateBackup(buildBackup(current({ problems: [problem('new')], settings: { ...current().settings, theme: 'light', dailyGoal: 6 } }))).backup
    const plan = planImport(existing, incoming, { mode: 'replace' })
    expect(plan.preview.removedProblems).toBe(1)
    expect(plan.next.problems.map((item) => item.id)).toEqual(['new'])
    expect(plan.next.settings).toMatchObject({ theme: 'light', dailyGoal: 6 })
  })

  it('exports RFC 4180 CSV with unicode, multiline notes, quote escaping, and formula defense', () => {
    const csv = exportProblemsCsv([problem('csv', {
      title: '=SUM(A1:A2), "quoted" café',
      topics: ['Arrays', 'Strings'],
      notes: '+unsafe\nsecond line "quoted"',
      url: '@danger',
      revision: { ...problem('x').revision, marked: true },
    })])
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('"\'=SUM(A1:A2), ""quoted"" café"')
    expect(csv).toContain('"Arrays, Strings"')
    expect(csv).toContain('"\'+unsafe\nsecond line ""quoted"""')
    expect(csv).toContain("'@danger")
    expect(csv).toContain(',2026-10-25,')
    expect(csv.endsWith('\r\n')).toBe(true)
  })
})
