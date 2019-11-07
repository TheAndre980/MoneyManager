
var datat = {
  allItems: {
    exp: [],
    inc: []
  },
  totals: {
    exp: 0,
    inc: 0
  },
  budget: 0,
  percentage: -1
};

(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var budgetSave;
var budgetExpenseTotal;
var dataGIncome;
var dataGExpenses;
var dataMoManager = [];

const { convertArrayToCSV } = require('convert-array-to-csv');

// BUDGET CONTROLLER

 var budgetController = (function(){
  
  var Expense = function(id,description,value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome){
    if(totalIncome > 0){
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function(){
    return this.percentage;
  };

  var Income = function(id,description,value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type){
    var sum = 0;
    datat.allItems[type].forEach(function(el){
      sum += el.value;
    });
    datat.totals[type] = sum;
  };

 

  return {
    addItem: function(type, des, val){
      var newItem,
          ID;
      
      // Create new ID
      if(datat.allItems[type].length>0){
        ID = datat.allItems[type][datat.allItems[type].length-1].id+1;
      } else {
        ID = 0;
      }

      // Create new item based on "inc" or "exp" type
      if(type === "exp"){
        newItem = new Expense(ID,des,val);
      } else if(type === "inc") {
        newItem = new Income(ID,des,val);
      }

      // Push it into our data structure
      datat.allItems[type].push(newItem);
      
      if(type === "exp"){

        const csvExpenses = convertArrayToCSV(datat.allItems.exp);
        dataGExpenses =  csvExpenses + "/";
        dataMoManager.splice(1, 1, dataGExpenses);
        console.log(dataMoManager);


      } else if(type === "inc") {

        const csvIncome = convertArrayToCSV(datat.allItems.inc);
        dataGIncome =  csvIncome + "/";
        dataMoManager.splice(0, 1, dataGIncome);
        console.log(dataMoManager);

      }
      

      console.log(dataGIncome);
      console.log(dataGExpenses);
      
      console.log(datat.allItems.inc);
      console.log(datat.allItems.exp);

      // Return the new element
      return newItem;
    },

    deleteItem: function(type,id){

        if (type === "exp") {
              var ids,
              index;

              ids = datat.allItems.exp.map(function(el){
                return el.id;
              });

              index = ids.indexOf(id);
              // console.log(index)
                datat.allItems.exp.splice(index, 1);
               
        } else if ( type === "inc") {
              var ids,
              index;

              ids = datat.allItems.inc.map(function(el){
                return el.id;
              });

              index = ids.indexOf(id);
              // console.log(index)
                datat.allItems.inc.splice(index, 1);
               
        }

    
    },

    calculateBudget: function(){

      // Calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      // Calculate budget: income - expenses
      datat.budget = datat.totals.inc - datat.totals.exp;
      // Calculate the percentage of income that we spent
      if(datat.totals.inc>0){
        datat.percentage = Math.round((datat.totals.exp / datat.totals.inc) * 100);
      } else {
        datat.percentage = -1;
      }
    },

    // calculatePercentage: function(){
    //   datat.allItems.exp.forEach(function(el){
    //     el.calcPercentage(datat.totals.inc);
    //   });
    // },

    getPercentage: function(){
      var allPerc = datat.allItems.exp.map(function(el){
        return el.getPercentage();
      });
      return allPerc;
    },

    getBudget: function(){
      return {
        budget: datat.budget,
        totalInc: datat.totals.inc,
        totalExp:  datat.totals.exp,
        percentage: datat.percentage
      }
    },

    // testitem: function(){
      // console.log(datat);
    // }
  }

})();


// UI CONTROLLER 
var UIController = (function(){

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

  var formatNumber = function(num,type){
    var numSplit,
        int,
        dec,
        sign;

    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    if(int.length>3){
      int = int.substr(0,int.length - 3)+"," + int.substr(int.length - 3,int.length);
    }

    dec = numSplit[1];

    return (type === "exp" ? sign = "-" : sign = "+") + " " + int + "." + dec;

  };

  var nodeListForEach = function(list,callback){
    for(var i=0; i<list.length; i++){
      callback(list[i],i);
    }
  };

  return {
    getInput: function(){
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj,type){
      var html,
          newHtml,
          element;

      // Create HTML string with placeholder text
      if(type === "inc"){
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle"></i></button></div></div></div>';
      } else if(type === "exp"){
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle"></i></button></div></div></div>'
      }
    

      // Write the Income and Expense data
      newHtml = html.replace("%id%",obj.id);
      newHtml = newHtml.replace("%description%",obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value,type));


      // Insert the Income and Expenses
      document.querySelector(element).insertAdjacentHTML("beforeend",newHtml);
    },
  
    deleteListItem: function(selectorID){
      var el;

      el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function(){
      var fields,
          fieldsArr;

      fields = document.querySelectorAll(DOMstrings.inputDescription+', '+DOMstrings.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(el,i,arr){
        el.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: function(obj){
      var type;
      obj.budget > 0 ? type = "inc" : type = "exp";

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,"inc");
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,"exp");

      if(obj.percentage>0){
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage+"%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }

    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function(el,i){
        if(percentages[i]>0){
          el.textContent = percentages[i] + "%";
        } else {
          el.textContent = "---";
        }
      });

    },

    displayMonth: function() {
      var now,
          month,
          months,
          year;

      now = new Date();

      months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
    },

    changedType: function(){
      var fields = document.querySelectorAll(
        DOMstrings.inputType + "," +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue
      );

      nodeListForEach(fields, function(el){
        el.classList.toggle("red-focus");
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");

    },

    getDOMstrings: function(){
      return DOMstrings;
    }
  };

})();


async function sendM() {
  if (state.loggedIn) {

    var dataLocal = dataMoManager.toString();

    console.log(dataLocal);
    
    var title = "Expenses";
    var transaction = await arweave.createTransaction(
      {
        data: dataLocal,
      },
      state.jwk
    );
    transaction.addTag("Application-ID", "MoneyManager");
    transaction.addTag("Title", title);
    await arweave.transactions.sign(transaction, state.jwk);
    const response = await arweave.transactions.post(transaction);
    console.log(response);
    // displayHeader(transaction.id);
  } else {
    alert("You must be signed in to save your expenses.");
  }
}
var save = document.getElementById("saveBtn");

save.onclick = function() {
  sendM();
};



//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl,UICtrl){

  var setupEventListeners = function(){
    var DOM = UICtrl.getDOMstrings();
    
    document.querySelector(DOM.inputBtn).addEventListener("click",ctrlAddItem);

    document.addEventListener("keypress",function(event){
      if(event.keyCode === 13 || event.which === 13){
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener("change",UICtrl.changedType);
  };

  var updateBudget = function(){
    // 1. Calculate the budget
    budgetController.calculateBudget();

    // 2. Return the budget
    var budget = budgetController.getBudget();
    budgetExpenseTotal = "/"  + budget.totalExp;
    budgetSave =  budget.budget;
    dataMoManager.splice(2, 1, budgetSave);
    dataMoManager.splice(3, 1, budgetExpenseTotal);


    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);
   
    console.log(budgetSave);
   
  };

  // var updatePercentages = function(){
  //   // 1. Calculate percentages
  //   budgetCtrl.calculatePercentage();
  //   // 2. Read percentages from the budget controller
  //   var percentages = budgetCtrl.getPercentage();
  //   // 3. Update the UI with the new percentages
  //   UICtrl.displayPercentages(percentages);
  // };

  var ctrlAddItem = function(){
    var input,
        newItem,
        addItem;

    // 1. Get the field input data
    input = UICtrl.getInput();

    if(input.description !== "" && !isNaN(input.value) && input.value>0){
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type,input.description,input.value);
      // 3. Add the item to the UI
      addItem = UICtrl.addListItem(newItem,input.type);
      // 4. Clear the fields
      UICtrl.clearFields();
      // 5. Calculate and update budget
      updateBudget();
      // 6. Calculate and update percentages
      // updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event){
    var itemID,
        splitID,
        type,
        ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(itemID){
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);
       console.log(type);

      switch(type){

        case 'inc':
          // 1. Delete the item from the data structure
         budgetController.deleteItem(type, ID);
         // console.log("1" + datat.allItems.exp);
         // 2. Delete the item from the UI
         UICtrl.deleteListItem(itemID);
         // console.log("2" + datat.allItems.exp);
   
         // 3. Update and show the new budget
         updateBudget();
         break

         case 'exp':
           // 1. Delete the item from the data structure
         budgetController.deleteItem(type, ID);
         // console.log("1" + datat.allItems.exp);
         // 2. Delete the item from the UI
         UICtrl.deleteListItem(itemID);
         // console.log("2" + datat.allItems.exp);
   
         // 3. Update and show the new budget
         updateBudget();
      }
       
         

      
      }
     
    }
    
  

  return {
    init: function(){
      console.log("Application has started");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  }

})(budgetController,UIController);



controller.init();
},{"convert-array-to-csv":5}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.appendElement = void 0;

var _checkSpecialCharsAndEmpty = require("./check-special-chars-and-empty");

var separatorOrLineBreak = function separatorOrLineBreak(length, elementIdx, separator) {
  return length - 1 === elementIdx ? '\n' : separator;
};

var escapeDoubleQuotesInsideElement = function escapeDoubleQuotesInsideElement(element) {
  var thisElement = element.replace(/"/g, '""');
  return thisElement;
};

var appendElement = function appendElement(element, lineLength, elementIdx, separator) {
  var includesSpecials = (0, _checkSpecialCharsAndEmpty.checkSpecialCharsAndEmpty)(element);
  var thisElement = element;

  if (includesSpecials) {
    thisElement = escapeDoubleQuotesInsideElement(thisElement);
  }

  return includesSpecials ? "\"".concat(thisElement, "\"").concat(separatorOrLineBreak(lineLength, elementIdx, separator)) : "".concat(thisElement).concat(separatorOrLineBreak(lineLength, elementIdx, separator));
};

exports.appendElement = appendElement;
},{"./check-special-chars-and-empty":4}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkIfValid = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var checkIfValid = function checkIfValid(data) {
  if (!Array.isArray(data)) {
    throw new Error("data has to be typeof: ".concat(_typeof([]), " and instanceof Array: ").concat([] instanceof Array, " but got typeof: ").concat(_typeof(data), " and instanceof Array: ").concat(data instanceof Array));
  }
};

exports.checkIfValid = checkIfValid;
},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkSpecialCharsAndEmpty = void 0;

var checkSpecialCharsAndEmpty = function checkSpecialCharsAndEmpty(value) {
  var thisValue = value.toString().toLowerCase();
  var hasSpecialChars = false;

  if (typeof value === 'string') {
    hasSpecialChars = thisValue.includes('\n') || thisValue.includes('\t') || thisValue.includes(',') || thisValue.includes(';') || thisValue.includes('.') || thisValue.includes('"') || thisValue.includes('\'') || thisValue.includes('`') || thisValue.includes('´') || thisValue.includes(' ') || thisValue.length === 0;
  }

  return hasSpecialChars;
};

exports.checkSpecialCharsAndEmpty = checkSpecialCharsAndEmpty;
},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.convertArrayToCSV = void 0;

var _checkIfValid = require("./helpers/check-if-valid");

var _convertArrayOfArraysToCsv = require("./modules/convert-array-of-arrays-to-csv");

var _convertArrayOfObjectsToCsv = require("./modules/convert-array-of-objects-to-csv");

var convertArrayToCSV = function convertArrayToCSV(data) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      header = _ref.header,
      separator = _ref.separator;

  (0, _checkIfValid.checkIfValid)(data);
  var thisOptions = {
    header: header,
    separator: separator || ','
  };

  if (Array.isArray(data[0])) {
    return (0, _convertArrayOfArraysToCsv.convertArrayOfArraysToCSV)(data, thisOptions);
  }

  return (0, _convertArrayOfObjectsToCsv.convertArrayOfObjectsToCSV)(data, thisOptions);
};

exports.convertArrayToCSV = convertArrayToCSV;
var _default = convertArrayToCSV;
exports["default"] = _default;
},{"./helpers/check-if-valid":3,"./modules/convert-array-of-arrays-to-csv":6,"./modules/convert-array-of-objects-to-csv":7}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertArrayOfArraysToCSV = void 0;

var _appendElement = require("../helpers/append-element");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var convertArrayOfArraysToCSV = function convertArrayOfArraysToCSV(data, _ref) {
  var header = _ref.header,
      separator = _ref.separator;

  var array = _toConsumableArray(data);

  var csv = '';

  if (header) {
    header.forEach(function (headerEl, i) {
      var thisHeaderEl = headerEl || (headerEl === 0 ? 0 : '');
      csv += (0, _appendElement.appendElement)(thisHeaderEl, header.length, i, separator);
    });
  }

  array.forEach(function (row) {
    row.forEach(function (value, i) {
      var thisValue = value || (value === 0 ? 0 : '');
      csv += (0, _appendElement.appendElement)(thisValue, row.length, i, separator);
    });
  });
  return csv;
};

exports.convertArrayOfArraysToCSV = convertArrayOfArraysToCSV;
},{"../helpers/append-element":2}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertArrayOfObjectsToCSV = void 0;

var _appendElement = require("../helpers/append-element");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var convertArrayOfObjectsToCSV = function convertArrayOfObjectsToCSV(data, _ref) {
  var header = _ref.header,
      separator = _ref.separator;

  var array = _toConsumableArray(data);

  var csv = '';

  if (header) {
    header.forEach(function (headerEl, i) {
      var thisHeaderEl = headerEl || (headerEl === 0 ? 0 : '');
      csv += (0, _appendElement.appendElement)(thisHeaderEl, header.length, i, separator);
    });
  }

  array.forEach(function (row, idx) {
    var thisRow = Object.keys(row);

    if (!header && idx === 0) {
      thisRow.forEach(function (key, i) {
        var value = key || (key === 0 ? 0 : '');
        csv += (0, _appendElement.appendElement)(value, thisRow.length, i, separator);
      });
    }

    thisRow.forEach(function (key, i) {
      var value = row[key] || (row[key] === 0 ? 0 : '');
      csv += (0, _appendElement.appendElement)(value, thisRow.length, i, separator);
    });
  });
  return csv;
};

exports.convertArrayOfObjectsToCSV = convertArrayOfObjectsToCSV;
},{"../helpers/append-element":2}]},{},[1]);
