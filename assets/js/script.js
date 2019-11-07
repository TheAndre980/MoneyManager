state = {
  loggedIn: false,
  wallet: null,
  jwk: null
};

var lastTxId;
//modal stuff:

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("loginBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  if (state.loggedIn) {
    location.reload();
  }
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

//login upload 

var filechoose = document.getElementById("keychoose");

filechoose.onchange = function(e) {
  
  var contentVisible = document.getElementById("content");
  var topVisible = document.getElementById("top");
  var bottomVisible = document.getElementById("bottom");
  var walletVisible = document.getElementById("wallet");

  var filelist = filechoose.files;


  if (filelist) {
    login(filelist, function(ev) {
      try {
        wallet = JSON.parse(ev.target.result);

        arweave.wallets.jwkToAddress(wallet).then((address) => {
          loginHandler(wallet, address);
            console.log(address);
            
            arweave.wallets.getLastTransactionID(address).then((transactionId) => {
              console.log(transactionId);
              lastTxId = transactionId;
              getMemoir();

            });

          contentVisible.classList.add("hidden");  // see which one is better from these two ! 
          contentVisible.classList.add("displaynone");
          topVisible.classList.remove("displaynone");
          topVisible.classList.remove("hidden");
          bottomVisible.classList.remove("hidden");
          bottomVisible.classList.remove("displaynone");
          walletVisible.classList.remove("displaynone");
          walletVisible.classList.remove("hidden");
     
            arweave.wallets.getBalance(address).then(balance => {
              let winston = balance;
              let ar = arweave.ar.winstonToAr(balance);

              document.getElementById("wallet").innerHTML = "<br><b>Wallet:</b> " + address + "<br><b>Balance:</b> " + ar;

              console.log(winston);

              console.log(ar);
        });
      });
      } catch (err) {
        alert("Error logging in. Please try again.");
        filechoose.value = "";
        success = false;
      } finally {
      }
    });
  }
};

 async function loginHandler(jwk, address) {
  state.loggedIn = true;
  state.wallet = address;
  state.jwk = jwk;
  document.getElementById("loginBtn").innerText = "Log Out";
  modal.style.display = "none";

  const txids = await arweave.arql({
    op: "and",
    expr1: {
      op: "equals",
      expr1: "from",
      expr2: address
    },
    expr2: {
      op: "equals",
      expr1: "Application-ID",
      expr2: "MoneyManager"
    }    
  });
  state.loggedIn = true;
  console.log(txids);
}

var bARNumber;
var expNumber;
var incomeList;
var expenseList;

async function getMemoir() {
  var transaction;
  var budgetAR;
  var expensesAR;
  var incomeLAR;
  var expenseLAR;

  try {
    transaction = await arweave.transactions.get(lastTxId);
  } catch {
    alert("Invalid memoir. ID is either invalid, or it hasn't been uploaded to the blockchain yet. Try again in a few minutes.");
  }
  var text = transaction.get("data", { decode: true, string: true });
  var tags = {};
  tags["Text"] = text;
  transaction.get("tags").forEach((tag) => {
    let key = tag.get("name", { decode: true, string: true });
    let value = tag.get("value", { decode: true, string: true });
    
    tags[key] = value;
  });

  var textArray = text.split("/");
  
  budgetAR = textArray[2].replace(",", "");
  expensesAR = textArray[3];
  expenseLAR = textArray[1];
  incomeLAR = textArray[0];
  console.log(text);
  console.log(budgetAR);

  //// Expense Loop ////
  var  bufferString = expenseLAR;

  var arr = bufferString.split('\n');     

  var jsonObj = [];
  var headers = arr[0].split(',');
  for(var i = 1; i < arr.length - 1; i++) {
    var data = arr[i].split(',');
    var obj = {};
    for(var j = 0; j < data.length; j++) {
       obj[headers[j].trim()] = data[j].trim();
    }
    jsonObj.push(obj);
  }

  expenseList = jsonObj;
  console.log(textArray[1]);
  console.log(jsonObj);
  console.log(JSON.stringify(expenseList));
 
  //////  Income Loop ///
  var  bufferStringr = incomeLAR;

  var arrr = bufferStringr.split('\n');     

  var jsonObjr = [];
  var headersr = arrr[0].split(',');
  for(var i = 1; i < arrr.length - 1; i++) {
    var datar = arrr[i].split(',');
    var objr = {};
    for(var j = 0; j < datar.length; j++) {
       objr[headersr[j].trim()] = datar[j].trim();
    }
    jsonObjr.push(objr);
  }

  incomeList = jsonObjr;
  console.log(textArray[0]);
  console.log(jsonObjr);
  console.log(JSON.stringify(incomeList));


  
  bARNumber = parseInt(budgetAR);
  expNumber = parseInt(expensesAR);

  document.getElementById("budgetV").innerHTML = bARNumber;
  document.getElementById("budgetV2").innerHTML = bARNumber;
  document.getElementById("expenseV").innerHTML = expNumber;


  var html,
  newHtml,
  element;

  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

    // Create HTML string with expenseList text
    for (const expense in expenseList) {
      element = DOMstrings.expensesContainer;
      html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle"></i></button></div></div></div>'
        // Write the Income and Expense data

        var expensy = {
          id: 0,
          description: "",
          value: 0,
          percentage: 0
        };

        expensy.value = parseInt(expenseList[expense].value);
        expensy.description = expenseList[expense].description;
        expensy.id = expenseList[expense].id;
        expensy.percentage = parseInt(expenseList[expense].percentage);

        
        newHtml = html.replace("%id%", expensy.id);
        newHtml = newHtml.replace("%description%", expensy.description);
        newHtml = newHtml.replace("%value%", expensy.value);
        
        
        datat.allItems.exp.push(expensy)

        console.log(expensy);
        console.log(datat.allItems.exp)
        // Insert the Income and Expenses
        document.querySelector(element).insertAdjacentHTML("beforeend",newHtml); 
    }

    for (const income in incomeList) {
      element = DOMstrings.incomeContainer;
      html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle"></i></button></div></div></div>'
        // Write the Income and Expense data

        var incomy = {
          id: 0,
          description: "",
          value: 0,
        };

        incomy.value = parseInt(incomeList[income].value);
        incomy.description = incomeList[income].description;
        incomy.id = incomeList[income].id;

        
        newHtml = html.replace("%id%", incomy.id);
        newHtml = newHtml.replace("%description%", incomy.description);
        newHtml = newHtml.replace("%value%", incomy.value);
        
        
        datat.allItems.inc.push(incomy)

        console.log(incomy);
        console.log(datat.allItems.inc)
        // Insert the Income and Expenses
        document.querySelector(element).insertAdjacentHTML("beforeend",newHtml); 
    }
 
  console.log(text);
  console.log(textArray);
  console.log(budgetAR);
}



