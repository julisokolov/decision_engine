import axios from "axios"

const baseUrl = 'http://localhost:3001/loans'

//Here's 3 event handlers to create new loan, get all the loans or delete a loan
const create = NewLoan => {
    const request = axios.post(baseUrl, NewLoan)
    return request.then(response => response.data)
}

const getAll = () => {
    const request = axios.get(baseUrl)
    return request.then(response => response.data)
}

const deleteLoan = id => {
    const request = axios.delete(`${baseUrl}/${id}`)
    return request.then(response => response.data)
}

const exporting = {create, getAll, deleteLoan}
export default exporting