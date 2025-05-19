
import { useNavigate, useLocation, useParams } from 'react-router-dom';

export const useRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  return {
    pathname: location.pathname,
    query: Object.fromEntries(new URLSearchParams(location.search)),
    params,
    push: (path: string, options?: { replace?: boolean }) => 
      navigate(path, { replace: options?.replace }),
    replace: (path: string) => navigate(path, { replace: true }),
    back: () => navigate(-1),
  };
};

export default useRouter;
