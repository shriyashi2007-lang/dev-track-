import { Modal } from './ui/Modal'

const shortcutGroups = [
  {
    title: 'General',
    items: [
      { key: 'Cmd/Ctrl + K', description: 'Open command palette' },
      { key: '?', description: 'Open keyboard shortcuts' },
      { key: 'T', description: 'Toggle dark / light theme' },
      { key: 'Esc', description: 'Close modal, drawer, or palette' },
    ],
  },
  {
    title: 'Navigation (Chords)',
    items: [
      { key: 'G then D', description: 'Go to Dashboard' },
      { key: 'G then P', description: 'Go to Problems' },
      { key: 'G then A', description: 'Go to Analytics' },
      { key: 'G then R', description: 'Go to Revision Tracker' },
      { key: 'G then S', description: 'Go to Settings' },
    ],
  },
  {
    title: 'Problem Tracking',
    items: [
      { key: 'N', description: 'Quick-add new problem' },
      { key: '/', description: 'Focus search input' },
    ],
  },
]

export function KeyboardShortcutsModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      description="Power through your prep without leaving your keyboard."
      maxWidth="max-w-xl"
    >
      <div className="space-y-5 mt-2">
        {shortcutGroups.map((group) => (
          <div key={group.title}>
            <h4 className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2.5">
              {group.title}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-2 rounded-subtle bg-base-elevated/50 border border-border-subtle"
                >
                  <span className="text-xs text-content-primary">{item.description}</span>
                  <kbd className="px-2 py-0.5 text-[11px] font-mono bg-base-surface text-content-primary rounded border border-border-strong shadow-sm font-semibold">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border-subtle flex justify-end">
        <button
          onClick={onClose}
          className="text-xs text-content-secondary hover:text-content-primary underline cursor-pointer"
        >
          Got it
        </button>
      </div>
    </Modal>
  )
}
