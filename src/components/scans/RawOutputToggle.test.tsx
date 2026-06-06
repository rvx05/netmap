import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { RawOutputToggle } from "./RawOutputToggle"

describe("RawOutputToggle", () => {
  const mockOutput = "Nmap scan report for 192.168.1.1"

  it("renders the toggle button", () => {
    render(<RawOutputToggle rawOutput={mockOutput} />)
    expect(screen.getByText(/raw Nmap output/i)).toBeInTheDocument()
  })

  it("hides raw output by default", () => {
    render(<RawOutputToggle rawOutput={mockOutput} />)
    expect(screen.queryByText(mockOutput)).not.toBeInTheDocument()
  })

  it("shows raw output when toggled", () => {
    render(<RawOutputToggle rawOutput={mockOutput} />)
    fireEvent.click(screen.getByText(/raw Nmap output/i))
    expect(screen.getByText(mockOutput)).toBeInTheDocument()
  })

  it("hides raw output when toggled off", () => {
    render(<RawOutputToggle rawOutput={mockOutput} />)
    fireEvent.click(screen.getByText(/raw Nmap output/i))
    expect(screen.getByText(mockOutput)).toBeInTheDocument()

    fireEvent.click(screen.getByText(/raw Nmap output/i))
    expect(screen.queryByText(mockOutput)).not.toBeInTheDocument()
  })

  it("shows the pre element with raw output content", () => {
    render(<RawOutputToggle rawOutput={mockOutput} />)
    fireEvent.click(screen.getByText(/raw Nmap output/i))
    const pre = screen.getByText(mockOutput).closest("pre")
    expect(pre).toBeInTheDocument()
    expect(pre).toHaveTextContent(mockOutput)
  })
})
