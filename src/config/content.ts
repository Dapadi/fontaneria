export const services = [
  { id:'reparacion-fugas', title:'Reparación de fugas', icon:'droplets', image:'fugas', alt:'Llave ajustable junto a una conexión de agua', desc:'Localización y reparación de pérdidas de agua, visibles u ocultas.', heading:'Qué observar antes de una visita', body:'¿La humedad aparece al abrir un grifo o incluso cuando no se usa agua? La diferencia ayuda a orientar la revisión hacia el suministro o el desagüe. Si es seguro, cierra la llave de paso y no desmontes conexiones.' },
  { id:'desatascos', title:'Desatascos', icon:'waves', image:'desatascos', alt:'Herramienta de desatasco junto a un desagüe de acero', desc:'Soluciones para desagües lentos, obstrucciones y malos olores.', heading:'Un desagüe lento o varios a la vez', body:'Si fallan varios aparatos al mismo tiempo, comunícalo antes de la visita: el problema puede estar en un tramo común. Si has usado un producto químico, indica cuál y no lo mezcles con otros.' },
  { id:'instalaciones-fontaneria', title:'Instalaciones de fontanería', icon:'pipette', image:'instalaciones', alt:'Tramos y uniones de tubería de cobre en una pared', desc:'Redes de agua y desagüe para cocinas, baños y otros espacios.', heading:'Planifica las tomas de agua y los desagües', body:'Prepara un plano o fotos y señala qué aparatos necesitan agua y desagüe. La posición de los puntos de uso, la ventilación y el acceso a las llaves se deben revisar antes de cerrar paredes o instalar muebles.' },
  { id:'reformas-banos', title:'Reformas de baños', icon:'bath', image:'banos', alt:'Baño de tonos cálidos con ducha y mueble de madera', desc:'Renovación de la fontanería y colocación de sanitarios.', heading:'Define el alcance de la reforma', body:'Aclara si conservas la distribución o si quieres mover el inodoro, el lavabo o la ducha. Conviene separar los trabajos de fontanería de los de albañilería y comprobar qué acabados y materiales incluye el presupuesto.' },
  { id:'griferia', title:'Grifería', icon:'droplet', image:'griferia', alt:'Grifo de cocina y encimera clara', desc:'Revisión, reparación y sustitución de grifos.', heading:'¿Reparar el grifo o sustituirlo?', body:'Identifica la marca, el modelo y el lugar exacto del goteo. Con esa información se puede valorar si existe un recambio compatible o si conviene un grifo nuevo.' },
  { id:'instalacion-termos', title:'Instalación de termos', icon:'thermometer', image:'termos', alt:'Termo eléctrico de pared y conexiones de agua', desc:'Preparación de las tomas y sustitución de termos.', heading:'Qué datos aportar sobre el termo', body:'Anota el modelo, la capacidad, el espacio disponible y la posición de las tomas. Si pierde agua, no manipules sus conexiones eléctricas; indica si el agua sale del equipo o de una conexión visible.' },
  { id:'mantenimiento', title:'Mantenimiento de comunidades', icon:'building-2', image:'mantenimiento', alt:'Profesional revisando un armario de contadores y llaves de paso', desc:'Revisión y mantenimiento de instalaciones compartidas.', heading:'Coordina el acceso y los cortes de suministro', body:'Antes de intervenir en una instalación común, identifica qué viviendas están afectadas, quién puede abrir el cuarto de contadores y cómo se avisará de un posible corte de agua.' },
  { id:'reparacion-tuberias', title:'Reparación de tuberías', icon:'wrench', image:'tuberias', alt:'Manos trabajando en la unión de un tramo de tubería', desc:'Reparación o sustitución de tramos dañados.', heading:'¿Qué tramo de la tubería está afectado?', body:'Indica si el tramo está visto o empotrado y si alimenta un aparato o una zona completa. Una foto accesible y el material visible pueden ayudar a preparar la revisión sin asumir que haga falta levantar acabados.' },
];

export const zones = [
  { id:'alzira', name:'Alzira', body:'Si la fuga afecta a un piso, anota si la humedad aparece en la vivienda, en una zona común o en el techo de un vecino. Indicar la dirección y si el contador es de fácil acceso facilita planificar la visita.' },
  { id:'carcaixent', name:'Carcaixent', body:'Para una sustitución de grifería o del termo, indica si ya tienes el equipo de recambio. Si el inmueble está en un núcleo distinto del casco urbano, comparte su nombre o un punto de encuentro.' },
  { id:'algemesi', name:'Algemesí', body:'Si se trata de un local, explica qué aparatos usan agua y en qué horario se pueden revisar. Si hay un desagüe atascado, comenta si el problema afecta también a otros locales o viviendas.' },
  { id:'alberic', name:'Alberic', body:'Para viviendas fuera del casco urbano, facilita un punto de encuentro y las indicaciones de acceso. Señala si la incidencia ocurre en un grifo exterior, en la entrada de suministro o dentro del inmueble.' },
];
export const extraZones = ['Guadassuar', "L’Alcúdia", 'Massalavés', 'Benimuslem', 'Corbera', 'Riola'];
export const steps = [
  ['Contacta con nosotros','Cuéntanos qué necesitas por teléfono o WhatsApp.','message-circle'],
  ['Valoramos tu problema','Analizamos la situación y te explicamos las posibles soluciones.','clipboard-list'],
  ['Realizamos el trabajo','Llevamos a cabo la intervención acordada.','wrench'],
  ['Comprobamos el resultado','Verificamos que la instalación funciona correctamente.','circle-check'],
];
export const values = [
  ['Atención personalizada','Empezamos por entender qué ocurre y qué necesitas resolver.','messages-square'],
  ['Comunicación clara','Explicamos qué se propone hacer antes de intervenir.','clipboard-list'],
  ['Soluciones adaptadas','Distinguimos lo que conviene reparar de lo que necesita sustituirse.','settings-2'],
  ['Profesionalidad','Acordamos el alcance y comprobamos el resultado al terminar.','shield-check'],
  ['Cercanía','Partimos de Alzira y confirmamos el desplazamiento según tu localidad.','map-pin'],
  ['Cuidado del espacio','Planificamos el acceso a la instalación y protegemos la zona de trabajo.','sparkles'],
];
