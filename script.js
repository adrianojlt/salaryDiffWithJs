const DefaultSalaryValue = 900;

const Situation = {
  NotMarried: '0',
  MarriedOneTitular: '1',
  MarriedTwoTitulares: '2'
}

const Type = {
  SOLD: {
    value: "SOLD" , 
    logic: notMarriedWithOneOrMoreDependents = (situation, dependentes) =>  
    situation == Situation.NotMarried && dependentes >= 1 
  },
  SOLCAS2: {
    value: "SOLCAS2",
    logic: notMarriedOrMarriedTwoTitularesWithoutDependents = (situation, dependentes) =>
      (situation == Situation.NotMarried || situation == Situation.MarriedTwoTitulares) && dependentes == 0
  },
  CAS2D: {
    value: "CAS2D",
    logic: marriedTwoTitularesWithOneOrMoreDependents = (situation, dependentes) =>
    situation == Situation.MarriedTwoTitulares && dependentes >= 1
  },
  CAS1: {
    value: "CAS1",
    logic: marriedTwoTitularesWithoutDependents = (situation, dependentes) =>
    situation == Situation.MarriedOneTitular && dependentes == 0
  },
  CAS1D: {
    value: "CAS1D",
    logic: marriedOneTitularWithOneOrMoreDependents = (situation, dependentes) =>
    situation == Situation.MarriedOneTitular && dependentes >= 1
  }
}

function getType(position) {

  var situation; 
  var dependents;

  if (position == 'left') {
    situation = situationLeft.value; 
     dependents = parseInt(dependentsLeft.value);
  }

  if (position == 'right') {
    situation = situationRight.value;
    dependents = parseInt(dependentsRight.value);
  }

  if (Type.SOLD.logic(situation, dependents)) {
    return Type.SOLD.value;
  }

  if (Type.SOLCAS2.logic(situation, dependents)) {
    return Type.SOLCAS2.value;
  }

  if (Type.CAS2D.logic(situation, dependents)) {
    return Type.CAS2D.value;
  }

  if (Type.CAS1.logic(situation, dependents)) {
    return Type.CAS1.value;
  }

  if (Type.CAS1D.logic(situation, dependents)) {
    return Type.CAS1D.value;
  }
}

function addSalaryInputListeners(input, range) {

    range.addEventListener('input', function() {
        input.value = range.value;
    });

    input.addEventListener('change', function(val) {

        const numsOnly = /^[0-9]*$/;

        if (!numsOnly.test(val.target.value)) {
          input.value = DefaultSalaryValue;
        }

        range.value = val.target.value;
    });
}

function copyValues(s1,d1,v1,y1,s2,d2,v2,y2) {
  s2.value = s1.value;
  d2.value = d1.value;
  v2.value = v1.value;
  y2.value = y1.value;
};

function addListeners() {

  addSalaryInputListeners(salaryInputLeft, salaryRangeLeft);
  addSalaryInputListeners(salaryInputRight, salaryRangeRight);

  dependentsLeft.addEventListener('change', function() {
    calculation('left');
  });

  dependentsRight.addEventListener('change', function() {
    calculation('right');
  });

  situationLeft.addEventListener('change', function() {
    calculation('left');
  });

  situationRight.addEventListener('change', function() {
    calculation('right');
  });

  salaryInputLeft.addEventListener('change', function() {
    calculation('left');
  });

  salaryInputRight.addEventListener('change', function() {
    calculation('right');
  });

  salaryRangeLeft.addEventListener('input', function(val) {
    salaryLeft.innerHTML = val.target.value;
    calculation('left');
  });

  salaryRangeRight.addEventListener('input', function(val) {
    salaryRight.innerHTML = val.target.value;
    calculation('right');
  });

  yearLeft.addEventListener('change', function() {
    calculation('left');
  });

  yearRight.addEventListener('change', function() {
    calculation('right');
  });

  salaryLeft.addEventListener('dblclick', function() {
  });

  salaryRight.addEventListener('dblclick', function() {
  });

  let lastTapTime = 0;

  // Listener to work also in mobile
  salaryLeft.addEventListener('click', function() {
    const currentTime = new Date().getTime();
    const timeSinceLastTap = currentTime - lastTapTime;
    
    if (timeSinceLastTap < 300) { // Adjust the threshold as needed
      copyValues(
          situationLeft, dependentsLeft, salaryInputLeft, yearLeft, 
          situationRight, dependentsRight, salaryInputRight, yearRight);
      salaryInputRight.dispatchEvent(new Event('change'));
    }
    
    lastTapTime = currentTime;
  });

  // Listener to work also in mobile
  salaryRight.addEventListener('click', function() {
    const currentTime = new Date().getTime();
    const timeSinceLastTap = currentTime - lastTapTime;
    
    if (timeSinceLastTap < 300) { // Adjust the threshold as needed
      copyValues(
          situationRight, dependentsRight, salaryInputRight, yearRight,
          situationLeft, dependentsLeft, salaryInputLeft, yearLeft);
      salaryInputLeft.dispatchEvent(new Event('change'));
    }
    
    lastTapTime = currentTime;
  });
}

function calculation(position) {
  
    var salaryInput;
    var dependents;
    var salaryLabel;
    var csvJson;

    if (position == 'left') {
      salaryInput = salaryInputLeft;
      rangeSalary = salaryRangeLeft;
      dependents = dependentsLeft;
      salaryLabel = salaryLeft;
      csvJson = csvJsons[yearLeft.value]
    }

    if (position == 'right') {
      salaryInput = salaryInputRight;
      rangeSalary = salaryRangeRight;
      dependents = dependentsRight;
      salaryLabel = salaryRight;
      csvJson = csvJsons[yearRight.value]
    }

    var type = getType(position);

    var inMaxRange = (x) => parseFloat(salaryInput.value) <  parseFloat(x.limite.replace(',','.')) && x.sinal == 'max';
    var inMinRange = (x) => parseFloat(salaryInput.value) >= parseFloat(x.limite.replace(',','.')) && x.sinal == 'min';

    var values = csvJson.filter(x => x.tipo === type && (inMaxRange(x) || inMinRange(x)));

    if (!values[0]) {
      salaryInput.value = DefaultSalaryValue;
      rangeSalary.value = DefaultSalaryValue;
      return; 
    }

    values = values[0];

    var percentage = (parseFloat(values.maximo.replace(/%/g,'').replace(',','.'))/100);
    var part = parseFloat(values.parcela_abater.replace(',','.'));
    var partDependents = parseFloat(values.adicional.replace(',','.')).toFixed(2);
    var partAditional = (parseFloat(partDependents) * parseFloat(dependents.value));
    var salaryWithTax = (parseFloat(salaryInput.value) * parseFloat(percentage)).toFixed(2);

    // Salário Líquido = Salário bruto - ( Descontos SS (11%) + Descontos IRS (ver tabela IRS) )
    // Descontos IRS = Remuneração Mensal x Taxa Marginal Máxima - Parcela a Abater - Parcela adicional a abater por dependente

    var irsDiscount = ( parseFloat(salaryWithTax) - part - parseFloat(partAditional) );
    var ssDiscont = parseFloat(salaryInput.value) * 0.11;
    var total = parseFloat(salaryInput.value) - (parseFloat(irsDiscount) + ssDiscont);

    salaryLabel.innerHTML = parseFloat(total).toFixed(2);

    salaryDiff.innerHTML = Math.abs(parseFloat(salaryInputLeft.value) - parseFloat(salaryInputRight.value)).toFixed(2);
    salaryNetDiff.innerHTML = Math.abs(parseFloat(salaryLeft.innerHTML) - parseFloat(salaryRight.innerHTML)).toFixed(2) 
}

function loadCSV(year) {

  fetch("taxas_continente_" + year +".csv")
    .then((response) => {
      return response.text();
    })
    .then((responseData) => {

      csv = responseData;

      // Parse CSV and convert to JSON
      Papa.parse(csv, {
        header: true, // Treat the first row as headers
        complete: function (results) {
          csvJsons[year] = results.data;
        },
        error: function (error) {
          console.error("Error parsing CSV:", error.message);
        },
      });

      calculation('left');
      calculation('right');
     
    })
    .catch((error) => {
      console.log(error);
    });
}

var csvJsons = [];

loadCSV("2024");
loadCSV("2023");

var dependentsLeft = document.getElementById('dependents01');
var situationLeft = document.getElementById('situation01');
var salaryLeft = document.getElementById('salaryLeft');
var yearLeft = document.getElementById('yearLeft');

var salaryRangeLeft = document.getElementById('salaryRangeLeft');
var salaryInputLeft = document.getElementById('salaryInputLeft');

var dependentsRight = document.getElementById('dependents02');
var situationRight = document.getElementById('situation02');
var salaryRight = document.getElementById('salaryRight');
var yearRight = document.getElementById('yearRight');

var salaryRangeRight = document.getElementById('salaryRangeRight');
var salaryInputRight = document.getElementById('salaryInputRight');

var salaryNetDiff = document.getElementById('salaryNetDiff');
var salaryDiff = document.getElementById('salaryDiff');

addListeners();