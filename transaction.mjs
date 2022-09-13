export default (sessionId, authorised) => {
    return {
        id: Math.random().toString().slice(2),
        authorised: authorised, ////////////////////// USED
        responseText: authorised ? "It was ok" : "You told it to fail, so it failed",
        sessionId: sessionId,
        a2a: {
          payerBankAccount: '00-0000-00000000-000',
          payerBankName: 'Fake Bank',
        },
    }
}