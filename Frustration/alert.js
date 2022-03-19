function createAlert(msg){
  let alert_container = document.getElementById("alerts");

  let div = document.createElement("div");
  div.className = "alert";
  let n_alerts = alert_container.childElementCount;
  div.style.top = 10 + 2*n_alerts + "vw";
  div.style.left = ((100-25)/2) + 2*n_alerts + "vw";

  let p = document.createElement("p");
  p.textContent = msg;
  div.appendChild(p);

  let button = document.createElement("button");
  button.className = "alert_ok_button";
  button.textContent = "OK";
  div.appendChild(button);

  alert_container.appendChild(div);
  alert_container.style.display = "block";
}
