export default function Container({children, className}) {
  return <div className={`px-4 mx-0 md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg 2xl:max-w-screen-xl sm:mx-auto ${className}`}>
    {children}
  </div>
}