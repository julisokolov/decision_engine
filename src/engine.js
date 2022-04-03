//this function checks all the loan id's. If there's an id with personal_code as the new loan id. Then has_debt function
//returns true, otherwise false
const has_debt = (code, loans) => {
    for (let index = 0; index < loans.length; index++) {
        if (loans[index].id===code) {
            return true
        }        
    }
    return false
}
//check_amount and check_period is used to check if data is valid
const check_amount = amount => {
    return amount>=2000&&amount<=10000
}

const check_period = period => {
    return period>=12&&period<=60
}

function maximum_sum (code, amount, period, callback) {
    //when this function is finished, it calls back the code that depends on the returned values
    var credit_modifier;
    var credit_score;
    //using personal_code, we check what is the right credit_modifier.
    if (code === 49002010976) {
        credit_modifier = 100
    } else if (code === 49002010987) {
        credit_modifier = 300
    } else if (code === 49002010998) {
        credit_modifier = 1000
    }
    if (credit_modifier) {
        //calculate credit score using the formula
        credit_score = (credit_modifier / amount) * period
        //if output is to big then 10000 is selected
        if (amount * credit_score >= 10000) {
            callback([10000, period])
            //if we can afford bigger amount, then it is multiplied by credit_score, after which new credit_score is equal to 1
        } else if (amount * credit_score >= 2000) {
            callback([amount * credit_score, period])
        } else {
            //Here is the case when we have to increase period, which is described in App component
            const suitable_period = 2000 / credit_modifier
            if (check_period(suitable_period)) {
                callback([2000, suitable_period])
            } else {callback([0,0])}           
        }
    }
    //if credit_modifier could not be found or we couldn't find suitable values, we return null
    else {callback([0,0])}
}

const exporting = {maximum_sum, has_debt, check_amount, check_period}
export default exporting