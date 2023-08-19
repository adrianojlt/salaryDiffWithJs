const Situacao = {
  Solteiro: '0',
  Casado1: '1',
  Casado2: '2'
}

const Tipo = {
  SOLD: "SOLD",         // Nao Casado, com 1 ou mais Dependentes
  SOLCAS2: "SOLCAS2",   // Nao Casado OU Casado 2 titulares sem Dependentes
  CAS2D: "CAS2D",       // Casado 2 Titulares, com 1 ou mais Dependentes 
  CAS1: "CAS1",         // Casado 1 Titular, sem Dependentes
  CAS1D: "CAS1D",       // Casado 1 Titular, com 1 ou mais Dependentes
}

function getLeftType(position) {

  var situacao; 
  var dependentes;

  if (position == 'left') {
     situacao = situationLeft.value; 
     dependentes = parseInt(dependentsLeft.value);
  }

  if (position == 'right') {
    situacao = situationRight.value;
    dependentes = parseInt(dependentsRight.value);
  }

  if (situacao == Situacao.Solteiro && dependentes >= 1) {
    return Tipo.SOLD;
  }

  if ( (situacao == Situacao.Solteiro || situacao == Situacao.Casado2) && dependentes == 0 ) {
    return Tipo.SOLCAS2;
  }

  if (situacao == Situacao.Casado2 && dependentes >= 1) {
    return Tipo.CAS2D;
  }

  if (situacao == Situacao.Casado1 && dependentes == 0) {
    return Tipo.CAS1;
  }

  if (situacao == Situacao.Casado1 && dependentes >= 1) {
    return Tipo.CAS1D;
  }
}

function addSalaryInputListeners(input, range) {

    range.addEventListener('input', function() {
        input.value = range.value;
    });

    input.addEventListener('change', function(val) {
        range.value = val.target.value;
    });
}

function addLeftListeners() {

}

function addRightListeners() {

}

function addListeners() {

  addSalaryInputListeners(salaryInputLeft, salaryRangeLeft);
  addSalaryInputListeners(salaryInputRight, salaryRangeRight);

  dependentsLeft.addEventListener('change', function(val) {
    calculation('left');
  });

  dependentsRight.addEventListener('change', function(val) {
    calculation('right');
  });

  situationLeft.addEventListener('change', function(val) {
    calculation('left');
  });

  situationRight.addEventListener('change', function(val) {
    calculation('right');
  });

  salaryInputLeft.addEventListener('change', function(val) {
    calculation('left');
  });

  salaryInputRight.addEventListener('change', function(val) {
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
}

function calculation(position) {
  
    var salaryInput;
    var dependents;
    var salaryLabel;

    if (position == 'left') {
      salaryInput = salaryInputLeft;
      dependents = dependentsLeft;
      salaryLabel = salaryLeft;
    }

    if (position == 'right') {
      salaryInput = salaryInputRight;
      dependents = dependentsRight;
      salaryLabel = salaryRight;
    }

    var type = getLeftType(position);

    var values = csvJson.filter(x => x.tipo === type && parseFloat(salaryInput.value) < parseFloat(x.limite.replace(',','.')));

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

    salaryDiff.innerHTML = Math.abs(parseFloat(salaryLeft.innerHTML) - parseFloat(salaryRight.innerHTML)).toFixed(2) 
}

function init() {

  fetch("taxas_continente.csv")
    .then((response) => {
      return response.text();
    })
    .then((responseData) => {

      csv = responseData;

      // Parse CSV and convert to JSON
      Papa.parse(csv, {
        header: true, // Treat the first row as headers
        complete: function (results) {
          csvJson = results.data;
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

init();

var csv = null;
var csvJson = null;

var salaryRangeLeft = document.getElementById('salaryRangeLeft');
var salaryInputLeft = document.getElementById('salaryInputLeft');

var dependentsLeft = document.getElementById('dependents01');
var situationLeft = document.getElementById('situation01');
var salaryLeft = document.getElementById('salaryLeft');

var salaryRangeRight = document.getElementById('salaryRangeRight');
var salaryInputRight = document.getElementById('salaryInputRight');

var situationRight = document.getElementById('situation02');
var dependentsRight = document.getElementById('dependents02');
var salaryRight = document.getElementById('salaryRight');

var salaryDiff = document.getElementById('salaryDiff');

addListeners();


