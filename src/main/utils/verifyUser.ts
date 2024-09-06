const verifyUser = (): boolean => {
  try {
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

export default verifyUser
