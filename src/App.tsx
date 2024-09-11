import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)

  const [isFilteredByEmployee, setIsFilteredByEmployee] = useState(false);

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  const loadEmployees = useCallback(async () => {
    setIsLoadingEmployees(true)
    await employeeUtils.fetchAll()
    setIsLoadingEmployees(false)
  }, [employeeUtils])
  
  const loadTransactions = useCallback(async () => {
    setIsLoadingTransactions(true)
    transactionsByEmployeeUtils.invalidateData()

    await paginatedTransactionsUtils.fetchAll()

    setIsLoadingTransactions(false)
  }, [paginatedTransactionsUtils, transactionsByEmployeeUtils])
  
  
  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadEmployees()
      loadTransactions()
    }
  }, [employeeUtils.loading, employees, loadEmployees, loadTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isLoadingEmployees}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null || newValue.id === EMPTY_EMPLOYEE.id) {
              setIsFilteredByEmployee(false);
              await loadTransactions()
              return
            }

            setIsFilteredByEmployee(true);
            await loadTransactionsByEmployee(newValue.id)
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />

          {!isFilteredByEmployee && transactions !== null && paginatedTransactions?.nextPage !== null && (
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading}
              onClick={async () => {
                await loadTransactions()
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
