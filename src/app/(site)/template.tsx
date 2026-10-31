// Нов екземпляр при всяка навигация: плавно влизане на страницата.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
