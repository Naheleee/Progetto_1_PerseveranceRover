        const curtain = document.getElementById('curtain');
        const scrollArrow = document.getElementById('scroll-arrow');
        const marteBg = document.getElementById('marte-bg');

        let currentY = 0;
        let targetY = 0;
        let ease = 0.05;
        let isExiting = false;

        function getMaxScroll() {
            return curtain.scrollHeight - window.innerHeight;
        }

        function smoothScroll() {
            if (!isExiting) {
                currentY += (targetY - currentY) * ease;
                curtain.style.transform = `translateY(-${currentY}px)`;
                marteBg.style.backgroundPositionY = `${currentY * 0.4}px`;
                requestAnimationFrame(smoothScroll);
            }
        }
        smoothScroll();

        window.addEventListener('wheel', (e) => {
            if (isExiting) return;

            const maxScroll = getMaxScroll();
            targetY += e.deltaY * 0.8;
            targetY = Math.max(0, Math.min(targetY, maxScroll));
        }, {
            passive: true
        });

        function liftCurtain() {
            if (isExiting) return;
            isExiting = true;
            curtain.classList.add('curtain-exit');
            setTimeout(() => {
                document.body.classList.add('fade-out');
                setTimeout(() => {
                    window.location.href = '../html/rover.html';
                }, 0);
            }, 1800);
        }

        scrollArrow.addEventListener('click', liftCurtain);

        window.addEventListener('load', () => {
            const loadOverlay = document.getElementById('load-overlay');
            setTimeout(() => {
                loadOverlay.classList.add('fade-out');
            }, 100);
        });

        window.addEventListener('resize', () => {
            const maxScroll = getMaxScroll();
            if (targetY > maxScroll) targetY = maxScroll;
        });

        let allPhotos = [];
        let currentPage = 0;
        const itemsPerPage = 1;

        async function fetchIOTWGrid() {
            const IOTW_API =
                "https://mars.nasa.gov/rss/api/?feed=raw_images&category=mars2020&feedtype=json&num=50&page=0&order=earth_date+desc&search=image_of_the_week";

            try {
                const response = await fetch(IOTW_API);
                const data = await response.json();

                if (data.images && data.images.length > 0) {
                    allPhotos = data.images;
                    renderGrid();
                }
            } catch (error) {
                console.error("Errore caricamento immagini:", error);
            }
        }

        function renderGrid() {
            const gridContainer = document.getElementById('photo-grid');
            gridContainer.innerHTML = '';

            const startIndex = currentPage * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const photosToShow = allPhotos.slice(startIndex, endIndex);

            photosToShow.forEach((photo) => {
                const itemDiv = document.createElement('div');
                itemDiv.style.backgroundColor = 'transparent';
                itemDiv.style.border = '0px solid lightgrey';
                itemDiv.style.display = 'flex';
                itemDiv.style.flexDirection = 'column';
                itemDiv.style.alignItems = 'center';
                itemDiv.style.justifyContent = 'center';
                itemDiv.style.overflow = 'hidden';

                const img = document.createElement('img');
                img.src = photo.image_files.medium || photo.image_files.full_res;

                img.style.width = '100%';
                img.style.height = 'auto';
                img.style.maxHeight = '400px';
                img.style.objectFit = 'contain';
                img.style.opacity = 0;
                img.style.transition = 'opacity 0.6s ease';

                img.onload = () => {
                    img.style.opacity = 1;
                };

                const dateText = document.createElement('p');
                const dateObj = new Date(photo.date_taken_utc);
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                dateText.textContent = formattedDate;
                dateText.style.marginTop = '15px';
                dateText.style.fontSize = '12px';
                dateText.style.color = 'black';
                dateText.style.fontWeight = '400';
                dateText.style.margin = '15px 0 0 0';
                dateText.style.opacity = '0.7';

                const solText = document.createElement('p');
                const dayNumber = Math.round(photo.sol * 1.0275);
                solText.textContent = `Sol ${photo.sol} - Day ${dayNumber}`;
                solText.style.marginTop = '15px';
                solText.style.fontSize = '14px';
                solText.style.color = 'black';
                solText.style.fontWeight = '500';
                solText.style.margin = '5px 0 0 0';

                itemDiv.appendChild(img);
                itemDiv.appendChild(dateText);
                itemDiv.appendChild(solText);
                gridContainer.appendChild(itemDiv);
            });
        }

        function nextPage() {
            const totalPages = Math.ceil(allPhotos.length / itemsPerPage);
            currentPage = (currentPage + 1) % totalPages;
            renderGrid();
        }

        function prevPage() {
            const totalPages = Math.ceil(allPhotos.length / itemsPerPage);
            currentPage = (currentPage - 1 + totalPages) % totalPages;
            renderGrid();
        }

        fetchIOTWGrid();
