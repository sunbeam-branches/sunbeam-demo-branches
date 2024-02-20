function createResult(error, data) {
    var result = {}
    if (error) {
      result["status"] = "error"
      result["error"] = error
    } else {
      result["status"] = "success"
      result["data"] = data
    }
    return result
  }
  
  module.exports = { createResult }
  