let verified = false;

// OTP SEND
async function sendOTP() {
  const email = document.getElementById("email").value;

  await fetch("/send-otp", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email })
  });

  alert("OTP Sent");
}

// OTP VERIFY
async function verifyOTP() {
  const email = document.getElementById("email").value;
  const otp = document.getElementById("otp").value;

  const res = await fetch("/verify-otp", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, otp })
  });

  const data = await res.json();

  if (data.success) {
    verified = true;
    alert("Verified");
  } else {
    alert("Wrong OTP");
  }
}

// FORM SUBMIT
document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!verified) {
    return alert("Verify OTP first");
  }

  const formData = new FormData(e.target);

  const res = await fetch("/submit", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  alert(data.msg);

  if (data.data) {
    document.getElementById("card").innerHTML = `
      <div style="border:2px solid black; padding:10px;">
        <h3>${data.data.name}</h3>
        <img src="/uploads/${data.data.photo}" width="100"/>
        <p>${data.data.enrollment}</p>
        <p>${data.data.mobile}</p>
        <p>${data.data.address}</p>
        <img src="${data.data.qr}" width="100"/>
      </div>
    `;
  }
});
