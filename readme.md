###<center>Where My Bus</center>

Recently I have looked at the Trafi mobile app. Among other features there was one which caught my eye. Trafi shows animated movement of public transport markers on the map. I decided to implement this feature for the web client and at the same time to test & try Mapbox online map service and its API. The scope of the new project was limited by my home town. After the short search I found only one source of real time positioning information for city buses and trolleybuses www.stops.lt/vilnius/gps_full.txt. The problem with this API is the amount of data received on each request 15-20 kb. I planned to poll for data at a 5 seconds interval. While the size of data transfer is not an issue for web clients, it is quite sensitive for mobile clients.
It was decided to put “the shunter in the middle”. That is backed service which takes data from stops.lt and filters out all data which is beyond client map. After deeper design of roles per character the backend took a lot under its hood:

- polls for real time public transport positioning data at 5 s interval;
- calculates and stores moving direction for all units, that allows to place new marker on the map immediately pointing to the correct direction
- setups bidirectional communication with client
- keeps track of client's map bounded area changes (when client makes pan and zoom)
- keeps track of client’s routes filter (for each transport type)
- feeds clients with relevant units position updates
- hibernates if no clients connected

**Development stack of Backend:** Typescript, Node.js, Socket.io

Web client ended up to be rather simple. I thought the challenging part would be to implement the marker with spout pointing to moving direction. But it was easily solved by using SVG image made of two layers. Thanks to Mapbox which supports SVG. First layer of circular shape with route number in the center doesn't rotate. The second layer is just for spout and it rotates to needed course. The tricky part was to deal with inconsistency of positioning data. Which led to freezed markers, marker jumps, and markers with animated movement outside roads.

**Development stack of Web client:** Pure JS, Redux, Socket.io, Webpack

Deployed at Digital Ocean: www.wheremybus.info
Github repo: https://github.com/alobikov/where-the-bus
