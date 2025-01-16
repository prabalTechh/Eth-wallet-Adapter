/* eslint-disable react/prop-types */


const Input = ({address, setAddress,placeholder ,reference}) => {
  return (
    <input
    ref={reference}
    type="text"
    placeholder={placeholder}
    value={address}
    onChange={(e) => setAddress(e.target.value)}
    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
  />
  )
}

export default Input