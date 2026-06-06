import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ScanListItem } from "./ScanListItem"

describe("ScanListItem", () => {
  const defaultProps = {
    id: "123",
    targetName: "Office Network",
    createdAt: "2026-06-01T12:00:00Z",
    tags: ["critical", "internal"],
  }

  it("renders the target name", () => {
    render(<ScanListItem {...defaultProps} />)
    expect(screen.getByText("Office Network")).toBeInTheDocument()
  })

  it("renders tags", () => {
    render(<ScanListItem {...defaultProps} />)
    expect(screen.getByText("critical")).toBeInTheDocument()
    expect(screen.getByText("internal")).toBeInTheDocument()
  })

  it("renders a link to the scan detail page", () => {
    render(<ScanListItem {...defaultProps} />)
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/dashboard/scan/123")
  })

  it("shows delete button", () => {
    render(<ScanListItem {...defaultProps} />)
    const deleteBtn = screen.getByText("DEL")
    expect(deleteBtn).toBeInTheDocument()
  })

  it("renders checkbox when onToggle is provided", () => {
    render(<ScanListItem {...defaultProps} onToggle={vi.fn()} selected={false} />)
    const checkbox = screen.getByRole("checkbox")
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
  })

  it("calls onToggle when checkbox is clicked", () => {
    const onToggle = vi.fn()
    render(<ScanListItem {...defaultProps} onToggle={onToggle} selected={false} />)
    fireEvent.click(screen.getByRole("checkbox"))
    expect(onToggle).toHaveBeenCalledWith("123")
  })
})
