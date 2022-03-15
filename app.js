//create a few custom functions
function findzero(arr) {
  var id = [0] //becomes array, just number w/o []
  var k = 0
  for (let i = 0; i < (arr.length - 1); i++) {
    if (Math.sign(arr[i]) == 0) {
      id[k] = i
      k++
    } else if (Math.sign(arr[i]) != Math.sign(arr[i + 1])) {
      id[k] = i
      k++
    }
  }
  return id
}

function linspace(min,max,nel) {
    var nel = nel-1
    var xMax = max; //max x   
    var xMin = min; //min x from previous section
    var x = [...Array(nel+1).keys()];
    x = x.map(a => a * ((xMax - xMin) / nel) + xMin)
    return x
  }

function mainFunc() {
//replicate Ivars code here
var Cf = document.querySelector("#Cf_in").value/-10
var Cr = document.querySelector("#Cr_in").value/-10
var prior = 1-(document.querySelector("#prior_in").value/100)
var P_f = [1-prior,prior]
var C_tot = []
C_tot[0] = [0,Cf]
C_tot[1] = [Cr,Cr]

var exp_u = []
exp_u[0] = C_tot[0][0]*P_f[0] + C_tot[0][1]*P_f[1]
exp_u[1] = C_tot[1][0]*P_f[0] + C_tot[1][1]*P_f[1] 



var P_th = P_f
var iMax = exp_u.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
var exp_uPrior = exp_u[iMax]


var methodRel =  document.querySelector("#methodRel_in").value/100
var C_E = document.querySelector("#C_E_in").value/-10
var exp_u = [exp_uPrior,0]
var decisionNames = ['Do not study','Study'];
var numO = 2; //Two possible utcomes from studying (topics covered or not covered)
var P_SL = [];
P_SL[0] = [1-methodRel, methodRel]
P_SL[1] = [methodRel, 1-methodRel] // Sample likelihood
var P_z = []
P_z[0] = P_SL[0][0]*P_th[0] + P_SL[0][1]*P_th[1]
P_z[1] = P_SL[1][0]*P_th[0] + P_SL[1][1]*P_th[1] 
var exp_u_star = new Array(numO).fill(0)

var P_post = []
for (let i = 0; i<numO; i++) {
    P_post[i] = P_th.map((x,j) => P_th[j] * P_SL[i][j] / P_z[i])
    exp_u_star[i] = Math.max(P_post[i][0]*C_tot[0][0]+P_post[i][1]*C_tot[0][1],
        P_post[i][0]*C_tot[1][0]+P_post[i][1]*C_tot[1][1])
}
exp_u[1] = P_z[0]*exp_u_star[0] + P_z[1]*exp_u_star[1] + C_E 

bounds_A = (x) => (Math.min(prior*Cf/Cr,1) - (Cf/Cr) * prior * x - (1-prior) * x - prior * (1-x))
bounds_B = (x) => (Math.min(prior*Cf/Cr,1) - (Cf/Cr) * prior * (1-x) - (1-prior) * (1-x) - prior * x)

var rel_lim1 = prior*(1-Cf/Cr)/(prior*(2-Cf/Cr)-1)
var rel_lim2 = 1-rel_lim1
var bound_cE = [bounds_A(0),0,0,bounds_B(1)]
var relE = [0,Math.min(rel_lim1,rel_lim2),Math.max(rel_lim1,rel_lim2),1]
//find zero crossing approximately at methodRel
var x = linspace(methodRel*0.5,methodRel*1.5,1000)
var y = x.map((x) => bounds_B(x)*Cr-C_E) //array
id = findzero(y);
var bound_methodRel = x[id]
var bound_methodCost = bounds_B(methodRel)*Cr;
if (bound_methodRel>1) {bound_methodRel = NaN}
if (bound_methodCost>1) {bound_methodCost = NaN}

boundsCrCf_A = (pf,pE,cEcF) => (pf*pE-cEcF)/((1-pf)*(1-pE)+pf*pE);
boundsCrCf_B = (pf,pE,cEcF) => (pf*(1-pE)+cEcF)/(1-(1-pf)*(1-pE)-pf*pE);
boundspf_A = (cRcF,pE,cEcF) => (cRcF*(1-pE)+cEcF)/(pE-cRcF*(2*pE-1));
boundspf_B = (cRcF,pE,cEcF) => (cRcF*pE-cEcF)/(cRcF*(2*pE-1)+1-pE);
pE_lim = (pf,cRcF) => Math.max((1-pf)/(1-pf*(2-1/cRcF)),1-(1-pf)/(1-pf*(2-1/cRcF)));


limit_pf_CrCf = []
if ((C_E/Cf*4/(2*methodRel-1)) < 1) {
limit_pf_CrCf[0] = 0.5 - Math.sqrt(0.25-C_E/Cf/(2*methodRel-1));
limit_pf_CrCf[1] = 0.5 + Math.sqrt(0.25-C_E/Cf/(2*methodRel-1));
} else {
limit_pf_CrCf[0] = NaN;
limit_pf_CrCf[1] = NaN;
}

var bound_RepairCost = new Array(2).fill(0);
if ((boundsCrCf_A(prior,methodRel,C_E/Cf) > 0)  &
(pE_lim(prior,boundsCrCf_A(prior,methodRel,C_E/Cf)) < methodRel) & 
(boundsCrCf_A(prior,methodRel,C_E/Cf) > boundsCrCf_B(prior,methodRel,C_E/Cf))) {
bound_RepairCost[1] = boundsCrCf_A(prior,methodRel,C_E/Cf)*Cf;
} else {
bound_RepairCost[1] = NaN;
}

if ((boundsCrCf_B(prior,methodRel,C_E/Cf) > 0)  &  
(pE_lim(prior,boundsCrCf_B(prior,methodRel,C_E/Cf)) < methodRel) & 
(boundsCrCf_A(prior,methodRel,C_E/Cf) > boundsCrCf_B(prior,methodRel,C_E/Cf))) {
bound_RepairCost[0] = boundsCrCf_B(prior,methodRel,C_E/Cf)*Cf;
} else {
bound_RepairCost[0] = NaN;
}

//bound prior could potentially be wrong, default values give zeros
var bound_prior = new Array(2).fill(0);
if ((boundspf_A(Cr/Cf,methodRel,C_E/Cf) > 0) &
(pE_lim(boundspf_A(Cr/Cf,methodRel,C_E/Cf),Cr/Cf) < methodRel) & 
(boundspf_A(Cr/Cf,methodRel,C_E/Cf) < boundspf_B(Cr/Cf,methodRel,C_E/Cf))) {
bound_prior[0] = boundspf_A(Cr/Cf,methodRel,C_E/Cf);
} else {
bound_prior[0] = NaN;
}

if ((boundspf_B(Cr/Cf,methodRel,C_E/Cf)) > 0 & 
(pE_lim(boundspf_B(Cr/Cf,methodRel,C_E/Cf),Cr/Cf) < methodRel) & 
(boundspf_A(Cr/Cf,methodRel,C_E/Cf) < boundspf_B(Cr/Cf,methodRel,C_E/Cf))) {
bound_prior[1] = boundspf_B(Cr/Cf,methodRel,C_E/Cf);
} else {
bound_prior[1] = NaN;
}

var numi = 100;
var CrCf = new Array(numi).fill(0);
Pf_lim = [];
Pf_lim[0] = new Array(numi).fill(0);
Pf_lim[1] = new Array(numi).fill(0);


if (!isNaN(limit_pf_CrCf[0])) {
    CrCf = linspace(limit_pf_CrCf[0],limit_pf_CrCf[1],numi);
    for (let i = 0; i<numi; i++) {
        Pf_lim[0][i] = boundspf_A(CrCf[i],methodRel,C_E/Cf); // lower bound
        Pf_lim[1][i] = boundspf_B(CrCf[i],methodRel,C_E/Cf); // upper bound
    }
     
    CrCf = [0,CrCf[0],...CrCf,CrCf[CrCf.length-1],1];
    Pf_lim[0] = [0,Pf_lim[0][0],...Pf_lim[0],Pf_lim[0][Pf_lim[0].length-1],1];
    Pf_lim[1] = [0,Pf_lim[1][0],...Pf_lim[1],Pf_lim[1][Pf_lim[1].length-1],1];
}


return res = {CrCf:CrCf,
    Pf_lim:Pf_lim,
    exp_u:exp_u, 
    P_z:P_z, 
    decisionNames:decisionNames, 
    bound_methodRel:bound_methodRel, 
    bound_methodCost:bound_methodCost, 
    bound_RepairCost:bound_RepairCost, 
    bound_prior:bound_prior,
    Cr:Cr,
    Cf:Cf,
    prior:prior}
}

function drawFunc(res) {
            //Create shapes
            var pathdef1 = 'M0,0'
            var pathdef2 = 'M0,0'
            var substr1 = [];
            var substr2 = [];
            
            //check if study choice exists
            var check = (res.CrCf.reduce((a,b) => a+b)>0.001 & 
            res.CrCf.reduce((a,b) => b>a?b:a)<1.001 &
            res.CrCf.reduce((a,b) => b>a?b:a)>-0.001)
            if (check) {
            
            for (let i = 0; i < res.CrCf.length; i++) {
                substr1 = 'L' + res.Pf_lim[0][i] + ',' + res.CrCf[i];
                substr2 = 'L' + res.Pf_lim[1][i] + ',' + res.CrCf[i];
                pathdef1 = pathdef1.concat(substr1)
                pathdef2 = pathdef2.concat(substr2)
            }
            pathdef1 = pathdef1 + 'L0,1' + 'L0,0' + 'Z';
            pathdef2 = pathdef2 + 'L1,0' + 'L0,0' + 'Z';
        } else {
            pathdef1 = pathdef1 + 'L1,1L0,1,L0,0Z'
            pathdef2 = pathdef2 + 'L1,1L1,0,L0,0Z'
        }

            var shape1 = {
                type: 'path', path: pathdef1, line: { width: 1, color: 'rgb(0,0,0)' }, fillcolor: 'rgba(0,0,150,0.5)',
                xref: "x1", yref: "y1"
            }
            var shape2 = {
                type: 'path', path: pathdef2, line: { width: 1, color: 'rgb(0,0,0)' }, fillcolor: 'rgba(150,0,0,0.5)',
                xref: "x1", yref: "y1"
            }
            
    
            var ax = document.querySelector("#myPlot")
            var trace = {
                x: [res.prior, res.prior],
                y: [res.Cr / res.Cf, res.Cr / res.Cf],
                type: 'markers',
                marker: {
                    color: 'rgb(255,0,0)',
                    size: 10
                },
            };
            var layout = {
                shapes: [shape1,shape2],
                xaxis: { range: [0, 1], title: "P<sub>f,prior</sub>" },
                yaxis: { range: [0, 1], title: "C<sub>r</sub>/C<sub>f</sub>", scaleanchor: 'x' },
                annotations: [{
                    text: "<b>Cheat!</b>",
                      font: {
                      size: 12,
                       color: 'black',
                    },
                    showarrow: false,
                    align: 'center',
                    x: 0.1,
                    y: 0.9,
                    xref: 'paper',
                    yref: 'paper',
                    },
                    {
                      text: "<b>Don't cheat!</b>",
                      font: {
                      size: 12,
                      color: 'black',
                    },
                    showarrow: false,
                    align: 'center',
                    x: 0.9,
                    y: 0.1,
                    xref: 'paper',
                    yref: 'paper',
                    },
                  ] 
            }
    
            if (check) {
                var annotation2 = {
                  text: "<b>Study!</b>",
                  font: {
                  size: 12,
                  color: 'black',
                },
                showarrow: false,
                align: 'center',
                textangle: -45,
                x: 0.5,
                y: 0.5,
                xref: 'paper',
                yref: 'paper',
                }
            layout.annotations.push(annotation2)
            }

            data = [trace]
            Plotly.newPlot(ax, data, layout)
}