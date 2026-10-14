/* REALM economy engine v2 — demo numbers are design placeholders, not real-world forecasts. */
(() => {
  const STORAGE_KEY = "realm_property_empire_v2";
  const LAND = [
    {id:"L1",name:"Riverside Lot",zone:"Residential",price:6500,road:false,icon:"▦"},
    {id:"L2",name:"Market Street Lot",zone:"Commercial",price:9800,road:true,icon:"▤"},
    {id:"L3",name:"North Garden Lot",zone:"Residential",price:5200,road:false,icon:"▦"},
    {id:"L4",name:"Central Avenue Lot",zone:"Mixed use",price:12500,road:true,icon:"▥"},
    {id:"L5",name:"East Works Lot",zone:"Industrial",price:8200,road:false,icon:"▧"},
    {id:"L6",name:"Harbor View Lot",zone:"Premium residential",price:16000,road:true,icon:"▥"}
  ];
  const BUILDINGS = [
    {id:"house",name:"Starter Homes",icon:"⌂",cost:4200,days:2,workers:1,rent:145,upkeep:32,tax:18,demand:2,zone:["Residential","Mixed use","Premium residential"],description:"Low-risk homes with modest, dependable rent."},
    {id:"apartments",name:"Apartment Block",icon:"▥",cost:9500,days:4,workers:2,rent:390,upkeep:88,tax:52,demand:4,zone:["Residential","Mixed use","Premium residential"],description:"More rent, more maintenance, and a larger crew requirement."},
    {id:"shops",name:"Retail Arcade",icon:"▤",cost:12500,days:5,workers:2,rent:520,upkeep:135,tax:75,demand:5,zone:["Commercial","Mixed use"],description:"Strong revenue if access and utilities are reliable."},
    {id:"tower",name:"Luxury Tower",icon:"▥",cost:26500,days:9,workers:4,rent:1280,upkeep:390,tax:210,demand:8,zone:["Premium residential","Mixed use"],description:"High upside, high carrying costs and longer construction."},
    {id:"warehouse",name:"Light Industrial Hub",icon:"▧",cost:15500,days:6,workers:3,rent:700,upkeep:230,tax:115,demand:6,zone:["Industrial","Mixed use"],description:"Business rent with significant utility demand."}
  ];
  const INFRA = [
    {id:"roads",name:"Road maintenance depot",icon:"🛣️",cost:9000,days:3,workers:2,upkeep:105,desc:"Builds and maintains access roads. Connected plots receive a value and access bonus.",kind:"network"},
    {id:"power",name:"Power station",icon:"⚡",cost:14500,days:5,workers:3,upkeep:210,desc:"Supplies electricity. Buildings without coverage lose part of their rent.",kind:"utility"},
    {id:"water",name:"Water treatment plant",icon:"💧",cost:11200,days:4,workers:2,upkeep:155,desc:"Supplies clean water to residential and commercial properties.",kind:"utility"},
    {id:"gas",name:"Gas distribution station",icon:"♨️",cost:9800,days:4,workers:2,upkeep:140,desc:"Supplies gas. Some buildings need gas to operate at full efficiency.",kind:"utility"}
  ];
  const DEMO = {machine:850,cleanup:420,permit:180,days:1,workers:2};
  const fresh = () => ({
    day:1,cash:42000,workers:4,workerHouses:0,plots:LAND.map((p,i)=>({...p,owned:i===0,building:null,project:null,services:{roads:p.road,power:false,water:false,gas:false}})),
    infrastructure:{roads:0,power:0,water:0,gas:0},projects:[],ledger:[{day:1,type:"Starting capital",detail:"Founder capital",amount:42000,balance:42000}],stats:{earned:0,spent:0,buildingsBuilt:0,demolitions:0},reputation:50
  });
  let state;
  const money = n => "$"+Math.round(n).toLocaleString("en-US");
  const esc = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function load(){try{const raw=localStorage.getItem(STORAGE_KEY);state=raw?JSON.parse(raw):fresh();}catch(e){state=fresh();}}
  function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
  function log(type,detail,amount){state.ledger.unshift({day:state.day,type,detail,amount,balance:state.cash});if(state.ledger.length>250)state.ledger.length=250;}
  function spend(amount,type,detail){if(state.cash<amount)return false;state.cash-=amount;state.stats.spent+=amount;log(type,detail,-amount);return true;}
  function earn(amount,type,detail){state.cash+=amount;state.stats.earned+=amount;log(type,detail,amount);}
  function owned(){return state.plots.filter(p=>p.owned);}
  function built(){return owned().filter(p=>p.building);}
  function emptyOwned(){return owned().filter(p=>!p.building&&!p.project);}
  function totalWorkers(){return state.workers + state.workerHouses*2;}
  function workersAssigned(){return state.projects.reduce((n,p)=>n+p.workers,0);}
  function freeWorkers(){return Math.max(0,totalWorkers()-workersAssigned());}
  function getBuilding(id){return BUILDINGS.find(b=>b.id===id);}
  function coverage(){return {roads:state.infrastructure.roads>0,power:state.infrastructure.power>0,water:state.infrastructure.water>0,gas:state.infrastructure.gas>0};}
  function serviceFactor(plot,b){const c=coverage();let f=1;if(!plot.services.roads&&!c.roads)f-=.18;if(!c.power)f-=.12;if(!c.water)f-=.12;if((b.id==="tower"||b.id==="warehouse"||b.id==="shops")&&!c.gas)f-=.06;return Math.max(.45,f);}
  function rentFor(plot){if(!plot.building)return 0;const b=getBuilding(plot.building);return b?Math.round(b.rent*serviceFactor(plot,b)*(1+state.reputation/500)):0;}
  function upkeepFor(plot){if(!plot.building)return 0;const b=getBuilding(plot.building);return b?b.upkeep:0;}
  function taxFor(plot){if(!plot.building)return 0;const b=getBuilding(plot.building);return b?b.tax:0;}
  function daily(){const rent=built().reduce((n,p)=>n+rentFor(p),0);const propertyCosts=built().reduce((n,p)=>n+upkeepFor(p)+taxFor(p),0);const infraCosts=Object.entries(state.infrastructure).reduce((n,[id,count])=>n+count*(INFRA.find(x=>x.id===id)?.upkeep||0),0);const staff=state.workerHouses*42;const service=rent*0.035;return {rent,propertyCosts,infraCosts,staff,service,net:rent-propertyCosts-infraCosts-staff-service};}
  function build(plotId,buildingId){const p=state.plots.find(x=>x.id===plotId),b=getBuilding(buildingId);if(!p||!p.owned||p.building||p.project||!b)return {ok:false,msg:"Choose an empty plot you own."};if(!b.zone.includes(p.zone))return {ok:false,msg:"This building plan is not approved for this zoning."};if(freeWorkers()<b.workers)return {ok:false,msg:"Not enough free workers. Hire workers or finish another project."};if(!spend(b.cost,"Construction","Started "+b.name+" at "+p.name))return {ok:false,msg:"Not enough cash for construction."};const project={id:"P"+Date.now(),type:"build",plotId:p.id,name:b.name,buildingId:b.id,daysLeft:b.days,daysTotal:b.days,workers:b.workers,cost:b.cost};p.project=project.id;state.projects.push(project);save();return {ok:true,msg:b.name+" construction started."};}
  function demolish(plotId){const p=state.plots.find(x=>x.id===plotId);if(!p||!p.building||p.project)return {ok:false,msg:"Choose a completed building without an active project."};if(freeWorkers()<DEMO.workers)return {ok:false,msg:"Demolition crew unavailable. Free up or hire workers."};const cost=DEMO.machine+DEMO.cleanup+DEMO.permit;if(!spend(cost,"Demolition","Machine hire, permit and debris removal at "+p.name))return {ok:false,msg:"Not enough cash for machine hire and cleanup ("+money(cost)+")."};const project={id:"D"+Date.now(),type:"demolish",plotId:p.id,name:"Demolition: "+getBuilding(p.building).name,daysLeft:DEMO.days,daysTotal:DEMO.days,workers:DEMO.workers,cost};p.project=project.id;state.projects.push(project);save();return {ok:true,msg:"Demolition crew booked. Cleanup is included."};}
  function buyLand(id){const p=state.plots.find(x=>x.id===id);if(!p||p.owned)return {ok:false,msg:"This plot is not available."};if(!spend(p.price,"Land purchase","Bought "+p.name))return {ok:false,msg:"Not enough cash to buy this land."};p.owned=true;save();return {ok:true,msg:"You now own "+p.name+"."};}
  function buyInfra(id){const def=INFRA.find(x=>x.id===id);if(!def)return {ok:false,msg:"Unknown infrastructure."};if(state.infrastructure[id]>0)return {ok:false,msg:"This prototype allows one city-wide facility of this type."};if(freeWorkers()<def.workers)return {ok:false,msg:"Not enough free workers for this project."};if(!spend(def.cost,"Infrastructure","Started "+def.name))return {ok:false,msg:"Not enough cash for this infrastructure."};const project={id:"I"+Date.now(),type:"infra",infraId:id,name:def.name,daysLeft:def.days,daysTotal:def.days,workers:def.workers,cost:def.cost};state.projects.push(project);save();return {ok:true,msg:def.name+" construction started."};}
  function buyWorkerHouse(){const cost=5200;if(state.workerHouses>=3)return {ok:false,msg:"Maximum of 3 worker houses in this prototype."};if(!spend(cost,"Worker housing","Built worker housing (+2 workers)"))return {ok:false,msg:"Not enough cash for worker housing."};state.workerHouses++;save();return {ok:true,msg:"Worker house complete: +2 workers. It costs $42/day to operate."};}
  function advanceDay(){state.day++;let completed=[];for(const p of [...state.projects]){p.daysLeft--;if(p.daysLeft<=0){completed.push(p);state.projects=state.projects.filter(x=>x.id!==p.id);if(p.type==="build"){const plot=state.plots.find(x=>x.id===p.plotId);plot.building=p.buildingId;plot.project=null;state.stats.buildingsBuilt++;state.reputation=Math.min(100,state.reputation+1);log("Project completed",p.name+" at "+plot.name,0);}else if(p.type==="demolish"){const plot=state.plots.find(x=>x.id===p.plotId);plot.building=null;plot.project=null;state.stats.demolitions++;state.reputation=Math.max(0,state.reputation-1);log("Demolition complete","Site cleared at "+plot.name,0);}else if(p.type==="infra"){state.infrastructure[p.infraId]++;state.plots.forEach(plot=>{if(p.infraId==="roads")plot.services.roads=true;else plot.services[p.infraId]=true;});state.reputation=Math.min(100,state.reputation+2);log("Infrastructure online",p.name,0);}}}
    const d=daily();if(d.net>=0)earn(d.net,"Daily operating result","Rent less maintenance, tax, utilities and staff");else{state.cash+=d.net;state.stats.spent+=Math.abs(d.net);log("Daily operating loss","Operating costs exceeded rent",d.net);if(state.cash<0)state.reputation=Math.max(0,state.reputation-2);}
    save();return {completed,net:d.net};}
  function reset(){state=fresh();save();}
  load();
  window.REALM={get state(){return state;},LAND,BUILDINGS,INFRA,DEMO,money,owned,built,emptyOwned,totalWorkers,workersAssigned,freeWorkers,daily,rentFor,upkeepFor,taxFor,coverage,serviceFactor,build,demolish,buyLand,buyInfra,buyWorkerHouse,advanceDay,reset,save,load};
})();