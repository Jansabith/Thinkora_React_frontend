import { useOutletContext } from 'react-router'

const NO_SHELL = { refreshNotifications: () => {} }

// Functions shared by the app shell with every page, for example:
//   const { refreshNotifications } = useShell()
export function useShell() {
  return useOutletContext() ?? NO_SHELL
}
