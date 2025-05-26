export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = (props: ButtonProps) => {
  return <button className="rounded bg-blue-500 px-4 py-2 font-bold text-white" {...props}>Click Me</button>
}
