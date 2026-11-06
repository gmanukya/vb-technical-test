interface ErrorTextProps {
  message: string | null
}

export function ErrorText({ message }: ErrorTextProps) {
  if (message === null) {
    return null
  }
  
  if (message.length === 0) {
    return null
  }
  
  return <p className="text-sm text-danger">{message}</p>
}
