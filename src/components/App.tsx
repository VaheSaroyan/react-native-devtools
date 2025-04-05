import Providers from "./external-dash/providers";
import Main from "./external-dash/Main";
export const App: React.FC = () => {
  return (
    <Providers>
      <Main />
    </Providers>
  );
};
