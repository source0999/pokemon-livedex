export default function PokemonTile({ id, name, isCaught, onToggle }) {
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

  return (
    <div
      onClick={() => onToggle(id)}
      className={`group relative flex flex-col items-center p-4 rounded-2xl cursor-pointer transition-all duration-500
        ${isCaught 
          ? 'glass border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)] scale-110 z-10' 
          : 'bg-transparent opacity-20 grayscale hover:opacity-100 hover:grayscale-0'
        }`}
    >
      <div className="absolute top-2 left-3 text-[8px] font-mono font-bold text-purple-400/50">ID_{id.toString().padStart(4, '0')}</div>
      
      {/* Floating Image Effect */}
      <img 
        src={imageUrl} 
        alt={name} 
        className={`w-full aspect-square object-contain transition-all duration-700 
          ${isCaught ? 'drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-float' : 'brightness-50'}`}
      />
      
      <span className={`text-[9px] font-black uppercase mt-3 tracking-widest transition-colors
        ${isCaught ? 'text-white' : 'text-slate-600 group-hover:text-purple-400'}`}>
        {name.replace('-', ' ')}
      </span>
    </div>
  );
}