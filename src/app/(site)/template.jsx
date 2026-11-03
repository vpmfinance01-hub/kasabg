// Нов екземпляр при всяка навигация: плавно влизане на страницата.
export default function Template({ children }) {
  return <div className="page-in">{children}</div>;
}
