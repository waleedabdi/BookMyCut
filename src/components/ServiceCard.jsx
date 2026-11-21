export default function ServiceCard({ service, onClick, isSelected }) { 

return ( 
<button 

type="button" 
onClick={() => onClick(service)} 
aria-pressed={isSelected} 
className={`w-full cursor-pointer rounded-xl border-2 p-5 text-left shadow-sm transition-all duration-200 hover:shadow-md ${ 
isSelected 
? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-amber-300" 

}`} 

> 
<h3 className="text-lg font-bold text-slate-800">{service.name}</h3> 
<div className="mt-3 flex justify-between text-sm font-medium text-slate-500"> 
<span className="text-amber-600 font-bold">KSh {service.price}</span> 
<span>{service.duration}</span> 
</div> 
</button> 
); 
} 

 