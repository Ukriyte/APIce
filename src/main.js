import './style.css'

const form = document.querySelector("[data-form]")
const queryParamsContainer = document.querySelector("[data-query-params]")
const requestHeadersContainer = document.querySelector("[data-request-headers]")
const keyValueTemplate = document.querySelector("[data-key-value-template]")
const responseHeadersContainer = document.querySelector("[data-response-headers]")

queryParamsContainer.append(createKeyValuePair())
requestHeadersContainer.append(createKeyValuePair())


document
  .querySelector("[data-add-query-param-btn]")
  .addEventListener("click", () => {
    queryParamsContainer.append(createKeyValuePair())
  })

document
  .querySelector("[data-add-request-header-btn]")
  .addEventListener("click", () => {
    requestHeadersContainer.append(createKeyValuePair())
  })



form.addEventListener("submit", async e => {
  e.preventDefault()

  let data = null
  try {
    const text = document.querySelector("[data-json-body]").value.trim()
    if (text !== "") data = JSON.parse(text)
  } catch (e) {
    alert("Invalid JSON in request body")
    return
  }

  const url = document.querySelector("[data-url]").value
  const method = document.querySelector("[data-method]").value

  const queryParams = keyValuePairsToObjects(queryParamsContainer)
  const headers = keyValuePairsToObjects(requestHeadersContainer)
  console.log(headers)
  const urlObj = new URL(url)
  Object.entries(queryParams).forEach(([k, v]) => {
    if (k.trim() !== "" && v.trim() !== "") {
      urlObj.searchParams.set(k, v)
    }
  })

  // const myHeaders =  new Headers();
  // myHeaders.append("Content-Type", "application/json");
  // myHeaders.append(...headers);

  try {
    console.log(headers)
    const res = await fetch(urlObj.toString(), {
      method,
      headers: headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    const text = await res.text()
    let parsedBody
    try {
      // Attempt to parse response as JSON
      parsedBody = text ? JSON.parse(text) : null
    } catch {
      // Fallback if parsing fails (e.g., HTML response, raw text)
      parsedBody = text
    }

    const statusElem = document.querySelector("[data-status]")
    statusElem.textContent = res.status
    updateStatusClasses(statusElem, res.status)

    updateResponseBody(parsedBody)
    updateResponseHeaders(res.headers)

    document.querySelector("[data-response-section]").classList.remove("d-none")
  } catch (error) {
    alert("Request failed: " + error.message)
  }
})



function updateResponseBody(body) {
  document.querySelector("[data-response-body]").textContent =
    JSON.stringify(body, null, 2)
}

function updateStatusClasses(element, status) {

  element.classList.remove("bg-green-500", "bg-yellow-500", "bg-red-500", "bg-gray-500", "text-white")

  if (status >= 200 && status < 300) {
    element.classList.add("bg-green-500", "text-white") 
  } else if (status >= 300 && status < 400) {
    element.classList.add("bg-yellow-500", "text-white") 
  } else if (status >= 400) {
    element.classList.add("bg-red-500", "text-white") 
  } else {
    element.classList.add("bg-gray-500", "text-white") 
  }
}

function updateResponseHeaders(headers) {
  responseHeadersContainer.innerHTML = ""
  
  const headerRow = document.createElement("div");
  headerRow.className = "contents font-bold text-gray-800 border-b border-gray-300 pb-1 mb-1"; 
  
  const keyTitle = document.createElement("div");
  keyTitle.textContent = "KEY";
  const valueTitle = document.createElement("div");
  valueTitle.textContent = "VALUE";
  headerRow.append(keyTitle, valueTitle);
  
  responseHeadersContainer.append(headerRow);
  
  
  headers.forEach((value, key) => {
    const rowContainer = document.createElement("div");
    rowContainer.className = "contents hover:bg-gray-100 transition-colors duration-100"; 
    
    const keyElem = document.createElement("div")
    keyElem.textContent = key
    keyElem.className = "truncate text-gray-700 p-1";
    
    const valElem = document.createElement("div")
    valElem.textContent = value
    valElem.className = "truncate text-gray-500 p-1";
    
    rowContainer.append(keyElem, valElem)
    responseHeadersContainer.append(rowContainer) 
  })
}



function createKeyValuePair() {
  const element = keyValueTemplate.content.cloneNode(true)
  element.querySelector("[data-remove-btn]").addEventListener("click", e => {
    e.target.closest("[data-key-value-pair]").remove()
  })
  return element
}

function keyValuePairsToObjects(container) {
  const pairs = container.querySelectorAll("[data-key-value-pair]")
  return [...pairs].reduce((data, pair) => {
    const key = pair.querySelector("[data-key]").value.trim()
    const value = pair.querySelector("[data-value]").value.trim()
    if (key === "") return data
    return { ...data, [key]: value }
  }, {})
}