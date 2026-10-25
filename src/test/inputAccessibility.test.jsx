import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Input, Textarea } from '../components/ui/Input'

describe('accessible form controls', () => {
  it('links input errors and textarea help to their controls', () => {
    render(
      <>
        <Input id="problem-title" label="Problem title" error="A title is required" />
        <Textarea id="problem-notes" label="Notes" helperText="Keep this concise" />
      </>
    )

    const input = screen.getByLabelText('Problem title')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('A title is required')
    expect(screen.getByRole('alert')).toHaveTextContent('A title is required')

    const textarea = screen.getByLabelText('Notes')
    expect(textarea).toHaveAttribute('aria-invalid', 'false')
    expect(textarea).toHaveAccessibleDescription('Keep this concise')
  })
})
