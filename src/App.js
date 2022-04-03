import React, {useState, useEffect} from 'react'
import loanService from './services'
import engine from './engine'

const App = () => {
    //Here I keep track of current loans
    const [loans, setLoans] = useState([])

    //Next 3 just keep track of what is currently written in input field
    const [newCode, setNewCode] = useState('')
    const [newAmount, setNewAmount] = useState('')
    const [newPeriod, setNewPeriod] = useState('')
    
    //Next 3 just hold the state whether, there's an error in selected field
    const [codeError, setCodeError] = useState(false)
    const [amountError, setAmountError] = useState(false)
    const [periodError, setPeriodError] = useState(false)

    //This holds the message text, that lies under the submit button. It can be seen while submitting a loan succesfully
    const [Message, setMessage] = useState(null)

    //UseEffect loads info about current loans, when code starts 
    useEffect(() => {
        loanService
          .getAll()
          .then(initialLoans => {
            setLoans(initialLoans)
          })
      }, [])
    
    //When submitted data is valid, this function is triggered, which processes amount and period, creating new loan
    //with maximum available amount that a person can ask for.
    const addLoan = (event) => {
        event.preventDefault()
        //engine is a program component. maximum_sum returns suitable amount and period. It calculates it using the
        //credit modifier and the formula for credit_score. If credit_score is bigger than one, then program tries to multiply
        //the requested amount by credit_score, if it does not exceed 10000, then the output money is increased times credit_score,
        //therefore new credit_score value is 1. If it exceeds then 10000 is the output. If credit_score < 1 then we increase period
        //value. To get suitable period we use credit score formula: credit_score=credit_modifier*period/amount. In order to loan be
        //valid credit_score must be 1. Also we substitute amount with 2000, which is minimal output. Therefore:
        //1 = credit_modifier * period / 2000 . Lets find formula for period: new_period = 2000 / credit_modifier. If new_period is
        // 12 <= new_period <= 10000 then it is accepted as new value.
        engine.maximum_sum(
            parseInt(newCode),
            parseInt(newAmount),
            parseInt(newPeriod),
            //i made a callback function, because otherwise maximum_sum would return undefined values.
            function (suitable_loan) {
                //if maximum_sum returns [0,0] it means it couldn't find suitable values or credit_modifier, then the
                //message is modified
                const suitable_amount = suitable_loan[0]
                const suitable_period = suitable_loan[1]
                if (suitable_amount===0&&suitable_period===0) {
                    setMessage('Could not find suitable amount or credit_modifier for this loan. Try changing the values.')
                }
                else {
                    //suitable amount and period are the values we get from maximum_sum.
                    const loanObject = {
                        id: parseInt(newCode),
                        amount: suitable_amount,
                        period: suitable_period,
                        date: new Date().toISOString()
                    }
                    //we create new loanObject using another component function and save it to the db.json file using json server and
                    //axios.
                    loanService
                        .create(loanObject)
                        //after new loan was created we, edit the message, to update the user
                        .then(
                            setMessage(`A loan has been approved!
                            Loan details:
                            Personal code: ${loanObject.id},
                            Loan amount: ${loanObject.amount},
                            Loan period in months: ${loanObject.period},
                            Date: ${loanObject.date}
                            `),
                            setNewCode(''),
                            setNewAmount(''),
                            setNewPeriod(''),
                            setLoans(loans.concat(loanObject)),
                            setTimeout(() => {
                                setMessage(null)
                            }, 15000)
                        )
                        .catch(error => {
                            setMessage("There's an error in input")
                            setTimeout(() => {
                                setMessage(null)
                            }, 15000)
                        }
                    )
                }
            }
        )
    }
    //Next 3 event handlers interpet the input data. It uses engine component functions, to check the input. If data is not valid
    //then specific error state is set to true, then according error message is displayed. E.x period input is 11, that is less than
    //requirements (12).
    const handleCodeChange = (event) => {
        setNewCode(event.target.value)
        setCodeError(false)
        //Error comes if user already has a laon registered for this personal code.
        if (engine.has_debt(parseInt(event.target.value), loans)) {
            setCodeError(true)
        }
    }
    const handleAmountChange = (event) => {
        setNewAmount(event.target.value)
        setAmountError(false)
        //amount must be between 2000 and 10000, otherwise error is returned
        if (!engine.check_amount(parseInt(event.target.value))) {
            setAmountError(true)
        }
    }
    const handlePeriodChange = (event) => {
        setNewPeriod(event.target.value)
        setPeriodError(false)
        //period must be between 12 and 60 months
        if (!engine.check_period(parseInt(event.target.value))) {
            setPeriodError(true)
        }
    }
    //Each loan is displayed on the screen with delete button. When pressed, it asks for confirmation, after that it deletes
    //object from db.json file and updates the displayed values using loanService component.
    const handleLoanDelete = id => {
        if (window.confirm('Delete loan?')) {
          loanService
            .deleteLoan(id)
            .then(setLoans(loans.filter(loan => loan.id !== id)))
        }
      }

    return (
        <div>
            <h1>Best loaning API #true</h1>
            <form onSubmit={addLoan}>
                <div>
                    <div>Please enter personal code:</div>
                    <input type="text" value={newCode} onChange={handleCodeChange} />
                    {/* Error is displayed if codeError value is set to true. Same with amount and period.*/}
                    {codeError ? <div className="alert">There is already loan registered for this personal code.</div> : <div></div>}
                </div>
                <div>
                    <div>Please enter amount:</div>
                    <input type="text" value={newAmount} onChange={handleAmountChange} />
                    {amountError ? <div className="alert">The input/output value must be between 2000 and 10 000.</div> : <div></div>}
                </div>
                <div>
                    <div>Please enter period(months):</div>
                    <input type="text" value={newPeriod} onChange={handlePeriodChange} />
                    {periodError ? <div className="alert">The period must be between 12 to 60 months.</div> : <div></div>}
                </div>
                {/* if one of three errors is true than submit button is disabled */}
                <button type="submit" disabled={codeError||amountError||periodError}>Apply</button>
            </form>
            {/* is the message shown, when loan has been created */}
            {Message === null ? <div></div> : <div className='success'>{Message}</div>}
            <table>
                {/*This creates a table using the loan data and map function*/}
                <thead>
                    <tr>
                        <th></th>
                        <th>Personal Code:</th>
                        <th>Amount:</th>
                        <th>Period:</th>
                        <th>Date:</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {loans.map((loan, i) =>
                        <tr key = {i}>
                            <td><b>{i + 1}.</b></td>
                            <td>{loan.id}</td>
                            <td>{loan.amount}</td>
                            <td>{loan.period}</td>
                            <td>{loan.date.substr(0,10)}</td>
                            {/*loan with personal code 49002010965 cant be deleted, because in the assignment it states that it */}
                            {/*should have a loan registered, so it couldn't take another loan. */}
                            <td><button onClick = {() => handleLoanDelete(loan.id)} disabled = {loan.id===49002010965}>delete</button></td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default App