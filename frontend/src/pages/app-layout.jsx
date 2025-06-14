import { MedicationProvider } from "./context/medication-context"

function AppLayout({ children }) {
  return <MedicationProvider>{children}</MedicationProvider>
}

export default AppLayout
