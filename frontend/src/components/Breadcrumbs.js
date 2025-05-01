
import { useLocation, Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/solid';

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav className="flex py-4 border-b" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          return (
            <li key={to} className="flex items-center">
              {index > 0 && <ChevronRightIcon className="h-5 w-5 text-gray-400" />}
              {last ? (
                <span className="text-sm font-medium text-gray-500 capitalize">
                  {value.replace(/-/g, ' ')}
                </span>
              ) : (
                <Link
                  to={to}
                  className="text-sm font-medium text-primary hover:text-primary-dark capitalize"
                >
                  {value.replace(/-/g, ' ')}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}