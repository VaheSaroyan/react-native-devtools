import { Dash } from "./external-dash/Dash";
import Providers from "./external-dash/providers";

export const App: React.FC = () => {
  return (
    <Providers>
      <Dash />
    </Providers>
  );
};
