export const firstErrorMessage = (error) => {
  let msg = null;
  error.graphQLErrors.map(e => {
    if (!msg) {
      msg = e.message;
    }
    return null;
  });
  return msg;
};