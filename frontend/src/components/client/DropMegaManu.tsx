// import React from 'react'

// const DropMegaManu = () => {
//   return (
//     <div>
//         <nav
//         aria-label="Main Category Navigation"
//         className="hidden md:block w-full bg-white border-b border-purple-100/70 relative z-30"
//       >
//         <div className="w-full px-4 sm:px-6 lg:px-10 2xl:px-16">
//           <ul className="flex items-center justify-between gap-1 lg:gap-2 text-xs xl:text-sm font-bold tracking-tight text-slate-700 overflow-x-auto scrollbar-none py-1">
//             {NAV_CATEGORIES.map((cat) => {
//               const hasSub = !!cat.hasMegaMenu;
//               const isHovered = activeMegaMenu?.id === cat.id;

//               return (
//                 <li
//                   key={cat.id}
//                   className="relative shrink-0"
//                   onMouseEnter={() => handleCategoryMouseEnter(cat)}
//                   onMouseLeave={handleCategoryMouseLeave}
//                 >
//                   <Link
//                     href={cat.href}
//                     className={`inline-flex items-center gap-1 px-2.5 lg:px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer ${
//                       isHovered
//                         ? 'text-purple-900 bg-purple-50/90 font-extrabold'
//                         : 'hover:text-purple-900 hover:bg-slate-50'
//                     }`}
//                   >
//                     <span>{cat.name}</span>

//                     {/* Caret for Mega Menu categories */}
//                     {hasSub && (
//                       <ChevronDown
//                         className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
//                           isHovered ? 'rotate-180 text-purple-900' : ''
//                         }`}
//                       />
//                     )}

//                     {/* Dynamic Tag / Badge */}
//                     {cat.badge && (
//                       <span
//                         className={`ml-1 text-[9px] uppercase px-1.5 py-0.2 rounded-full font-extrabold ${
//                           cat.badge.variant === 'gold'
//                             ? 'bg-amber-400 text-slate-950 border border-amber-300'
//                             : 'bg-purple-900 text-white'
//                         }`}
//                       >
//                         {cat.badge.text}
//                       </span>
//                     )}
//                   </Link>
//                 </li>
//               );
//             })}
//           </ul>
//         </div>

//         {/* Mega Menu Dropdown */}
//         {activeMegaMenu && (
//           <div
//             onMouseEnter={handleMegaMenuMouseEnter}
//             onMouseLeave={handleMegaMenuMouseLeave}
//           >
//             <MegaMenu
//               category={activeMegaMenu}
//               onClose={() => setActiveMegaMenu(null)}
//             />
//           </div>
//         )}
//       </nav>
//     </div>
//   )
// }

// export default DropMegaManu