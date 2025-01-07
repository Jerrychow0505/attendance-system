export function Alert({ className, children, variant = "default" }) {
  const variantStyles = {
    default: "bg-background",
    destructive: "bg-red-50 text-red-700 border-red-200",
  }
  
  return (
    <div className={`relative w-full rounded-lg border p-4 ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  )
}

export function AlertDescription({ className, children }) {
  return <div className={`text-sm ${className}`}>{children}</div>
}