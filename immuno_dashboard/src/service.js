
const url = "https://api.immunochain.dev/"
//const access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZGVudGl0eSI6MywiaWF0IjoxNTY5MzAyNzExLCJmcmVzaCI6ZmFsc2UsInR5cGUiOiJhY2Nlc3MiLCJuYmYiOjE1NjkzMDI3MTEsImp0aSI6IjdmMjY4NWY2LTY5ZWUtNDM2ZC05NGE1LWVmNjBjM2Y1MmViYiIsImV4cCI6MTE1NjkzMDI3MTN9.EjgBe2kZtoU_mkwM9G4r6tojrOxzda3kXo4Z9yXB2Ts"
const access_token = localStorage.getItem('access_token');


const apiCall = async (action, method, body) => {
  // console.log("ok");


  if (method === "POST") { //POST
    let data = await fetch(url + action, {
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + access_token
      },
      body: body
    })
    // console.log(data)
    let res = await data.json();
    // console.log(res);
    if (data.status === 401) {
      //alert("Session Expired");
      console.log('session expired');
      sessionStorage.setItem('logged_in', false);
      // window.href = '/'
    }
    //else {
    return (res);
  }

  else { //GET
    console.log("get");
    let data = await fetch(url + action, {
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + access_token
      },
    })
    // console.log(data)
    let res = await data.json();
    // console.log(res);
    if (data.status === 401) {
      //alert("Session Expired");
      console.log('session expired');
      sessionStorage.setItem('logged_in', false);
      // window.href = '/'
    }
    //else {
    return (res);
    //}
    // .then(await function (res) {
    //   console.log(res.json());
    //   // return (res.json())
    // })
  }


}

const fileDownload = async (action) => {
  // console.log("ok");
  // var access_token = localStorage.getItem('access_token');


  let data = await fetch(url + action, {
    method: "GET",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    },
  })
  // console.log(data)
  // console.log(res);
  if (data.status === 401) {
    //alert("Session Expired");
    console.log('session expired');
    sessionStorage.setItem('logged_in', false);
    // window.href = '/'
  }
  //else {
  return (data);

}

export default apiCall;
export { fileDownload, url };
