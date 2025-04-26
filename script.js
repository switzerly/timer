document.addEventListener('DOMContentLoaded', () => {
    
    
    document.body.addEventListener('touchmove', function(e) {
        
        if (Math.abs(e.touches[0].clientX) > 10) {
            e.preventDefault();
        }
    }, { passive: false });
    
    
    function fixViewportHeight() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    
    fixViewportHeight();
    window.addEventListener('resize', fixViewportHeight);
    
    const birthForm = document.getElementById('birth-form');
    const inputSection = document.getElementById('input-section');
    const resultSection = document.getElementById('result-section');
    const ageCounter = document.getElementById('age-counter');
    const lifeTime = document.getElementById('life-time');
    const resetBtn = document.getElementById('reset-btn');
    const hourHand = document.querySelector('.hour-hand');
    const minuteHand = document.querySelector('.minute-hand');
    const secondHand = document.querySelector('.second-hand');
    const container = document.querySelector('.container');
    
    
    document.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });
    
    document.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    });
    
    document.querySelectorAll('button, input[type="submit"]').forEach(button => {
        button.addEventListener('touchstart', function() {}, { passive: true });
    });
    
    const LIFE_START_HOUR = 7;
    const LIFE_END_HOUR = 22;
    const LIFE_SPAN_HOURS = LIFE_END_HOUR - LIFE_START_HOUR;
    const EXPECTED_LIFE_YEARS = 73; 
    
    
    let birthDate;
    let animationFrameId;
    let isAnimating = false;
    
    
    birthForm.addEventListener('submit', handleFormSubmit);
    resetBtn.addEventListener('click', resetCalculator);
    
    document.addEventListener('click', handleDocumentClick);
    
    
    const birthdateInput = document.getElementById('birthdate');
    birthdateInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);
        
        if (value.length > 4) {
            value = value.slice(0, 2) + '.' + value.slice(2, 4) + '.' + value.slice(4);
        } else if (value.length > 2) {
            value = value.slice(0, 2) + '.' + value.slice(2);
        }
        
        e.target.value = value;
    });
    
    
    checkSavedBirthdate();
    
    
    function handleDocumentClick(e) {
        if (!container.contains(e.target)) {
            createFloatingText(e.clientX, e.clientY);
        }
    }
    
    
    function createFloatingText(x, y) {
        const text = document.createElement('div');
        text.className = 'time-float';
        text.textContent = 'time';
        
        text.style.left = `${x}px`;
        text.style.top = `${y}px`;
        
        document.body.appendChild(text);
        
        setTimeout(() => {
            if (text.parentNode) {
                text.parentNode.removeChild(text);
            }
        }, 1000);
    }
    
    
    function checkSavedBirthdate() {
        const savedBirthdate = localStorage.getItem('birthdate');
        const savedBirthtime = localStorage.getItem('birthtime');
        
        if (savedBirthdate) {
            document.getElementById('birthdate').value = savedBirthdate;
            
            if (savedBirthtime) {
                document.getElementById('birthtime').value = savedBirthtime;
            }
            
            const [day, month, year] = savedBirthdate.split('.').map(Number);
            const [hours, minutes] = (savedBirthtime || '00:00').split(':').map(Number);
            
            birthDate = new Date(year, month - 1, day, hours, minutes, 0);
            
            inputSection.classList.add('hidden');
            resultSection.classList.remove('hidden');
            
            startAgeCounter();
        }
    }
    
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const birthdateValue = document.getElementById('birthdate').value;
        const birthtimeValue = document.getElementById('birthtime').value || '00:00';
        
        if (!birthdateValue) {
            alert('Please enter your birth date');
            return;
        }
        
        const [day, month, year] = birthdateValue.split('.').map(Number);
        const [hours, minutes] = birthtimeValue.split(':').map(Number);
        
        if (isNaN(day) || isNaN(month) || isNaN(year) || 
            day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) {
            alert('Please enter a valid date in DD.MM.YYYY format');
            return;
        }
        
        localStorage.setItem('birthdate', birthdateValue);
        localStorage.setItem('birthtime', birthtimeValue);
        
        birthDate = new Date(year, month - 1, day, hours, minutes, 0);
        
        inputSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
        
        startAgeCounter();
    }
    
    
    function startAgeCounter() {
        if (isAnimating) {
            return;
        }
        
        isAnimating = true;
        animationLoop();
    }
    
    
    function animationLoop() {
        updateAge();
        animationFrameId = requestAnimationFrame(animationLoop);
    }
    
    
    function updateAge() {
        const now = new Date();
        const ageInMilliseconds = now - birthDate;
        
        const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
        ageCounter.textContent = ageInYears.toFixed(9);
        
        updateLifeClock(ageInYears);
    }
    
    
    function updateLifeClock(ageInYears) {
        
        const lifePercentage = ageInYears / EXPECTED_LIFE_YEARS;
        
        const totalLifeMinutes = LIFE_SPAN_HOURS * 60 * lifePercentage;
        
        const lifeHours = Math.floor(totalLifeMinutes / 60) + LIFE_START_HOUR;
        const lifeMinutes = Math.floor(totalLifeMinutes % 60);
        const lifeSeconds = Math.floor((totalLifeMinutes * 60) % 60);
        const lifeMilliseconds = Math.floor((totalLifeMinutes * 60 * 1000) % 1000);
        
        lifeTime.textContent = formatTime(lifeHours, lifeMinutes, lifeSeconds);
        
        
        const hourAngle = ((lifeHours % 12) * 30) + (lifeMinutes * 0.5);
        const minuteAngle = lifeMinutes * 6 + (lifeSeconds * 0.1);
        const secondAngle = lifeSeconds * 6 + (lifeMilliseconds * 0.006);
        
        hourHand.style.transform = `rotate(${hourAngle}deg)`;
        minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
        secondHand.style.transform = `rotate(${secondAngle}deg)`;
    }
    
    
    function formatTime(hours, minutes, seconds) {
        return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
    }
    
    
    function padZero(num) {
        return num.toString().padStart(2, '0');
    }
    
    
    function resetCalculator() {
        if (isAnimating) {
            cancelAnimationFrame(animationFrameId);
            isAnimating = false;
        }
        
        birthForm.reset();
        document.getElementById('birthtime').value = '00:00';
        
        localStorage.removeItem('birthdate');
        localStorage.removeItem('birthtime');
        
        inputSection.classList.remove('hidden');
        resultSection.classList.add('hidden');
    }
}); 