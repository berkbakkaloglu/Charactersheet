document.addEventListener('DOMContentLoaded', () => {
    const characterId = window.location.pathname.split('/').pop();
    const userRole = document.getElementById('user-role').value;
    const inventoryList = document.getElementById('inventory-list');
    const spellList = document.getElementById('spell-list');
    const conditionList = document.getElementById('condition-list');

    // Stat güncelleme
    if (userRole === 'admin') {
        document.querySelectorAll('.stat-increase').forEach(button => {
            button.addEventListener('click', async () => {
                const stat = button.getAttribute('data-stat');
                const statElement = document.getElementById(stat);
                const newValue = parseInt(statElement.value) + 1;
                statElement.value = newValue;
                await updateStat(stat, newValue);
            });
        });

        document.querySelectorAll('.stat-decrease').forEach(button => {
            button.addEventListener('click', async () => {
                const stat = button.getAttribute('data-stat');
                const statElement = document.getElementById(stat);
                const newValue = parseInt(statElement.value) - 1;
                statElement.value = newValue;
                await updateStat(stat, newValue);
            });
        });

        async function updateStat(stat, value) {
            try {
                const response = await fetch(`/api/characters/${characterId}/stats`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ [stat]: value })
                });
                if (!response.ok) {
                    throw new Error('Stat güncellenirken bir hata oluştu.');
                }
            } catch (error) {
                console.error('Hata:', error);
                alert('Stat güncellenirken bir hata oluştu.');
            }
        }
    }

    // Envantere öğe ekleme
    if (userRole === 'admin' || userRole === 'user') {
        document.getElementById('add-inventory').addEventListener('click', async () => {
            const item = document.getElementById('inventory-item').value.trim();
            if (item !== '') {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                listItem.innerHTML = `${item} <button class="btn btn-danger btn-sm remove-item" data-item="${item}">Sil</button>`;
                inventoryList.appendChild(listItem);
                document.getElementById('inventory-item').value = '';
                await updateInventory();
            }
        });
    }

    // Büyü ekleme
    if (userRole === 'admin') {
        document.getElementById('add-spell').addEventListener('click', async () => {
            const spell = document.getElementById('spell-item').value.trim();
            if (spell !== '') {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                listItem.innerHTML = `${spell} <button class="btn btn-danger btn-sm remove-spell" data-spell="${spell}">Sil</button>`;
                spellList.appendChild(listItem);
                document.getElementById('spell-item').value = '';
                await updateSpells();
            }
        });
    }

    // Durum ekleme
    if (userRole === 'admin') {
        document.getElementById('add-condition').addEventListener('click', async () => {
            const condition = document.getElementById('condition-item').value.trim();
            if (condition !== '') {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                listItem.innerHTML = `${condition} <button class="btn btn-danger btn-sm remove-condition" data-condition="${condition}">Sil</button>`;
                conditionList.appendChild(listItem);
                document.getElementById('condition-item').value = '';
                await updateConditions();
            }
        });
    }

    // Özgeçmiş güncelleme
    if (userRole === 'admin' || userRole === 'user') {
        document.getElementById('update-biography').addEventListener('click', async () => {
            const biography = document.getElementById('biography').value.trim();
            try {
                const response = await fetch(`/api/characters/${characterId}/biography`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ biography: biography })
                });
                if (!response.ok) {
                    throw new Error('Özgeçmiş güncellenirken bir hata oluştu.');
                }
            } catch (error) {
                console.error('Hata:', error);
                alert('Özgeçmiş güncellenirken bir hata oluştu.');
            }
        });
    }

    // Öğeleri silme
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('remove-item')) {
            e.target.parentElement.remove();
            await updateInventory();
        }
        if (e.target.classList.contains('remove-spell')) {
            e.target.parentElement.remove();
            await updateSpells();
        }
        if (e.target.classList.contains('remove-condition')) {
            e.target.parentElement.remove();
            await updateConditions();
        }
    });

    async function updateInventory() {
        const inventoryItems = Array.from(inventoryList.children).map(item => item.firstChild.textContent.trim());
        try {
            const response = await fetch(`/api/characters/${characterId}/inventory`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ inventory: inventoryItems })
            });
            if (!response.ok) {
                throw new Error('Envanter güncellenirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Hata:', error);
            alert('Envanter güncellenirken bir hata oluştu.');
        }
    }

    async function updateSpells() {
        const spellItems = Array.from(spellList.children).map(item => item.firstChild.textContent.trim());
        try {
            const response = await fetch(`/api/characters/${characterId}/spells`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ spells: spellItems })
            });
            if (!response.ok) {
                throw new Error('Büyüler güncellenirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Hata:', error);
            alert('Büyüler güncellenirken bir hata oluştu.');
        }
    }

    async function updateConditions() {
        const conditionItems = Array.from(conditionList.children).map(item => item.firstChild.textContent.trim());
        try {
            const response = await fetch(`/api/characters/${characterId}/conditions`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ conditions: conditionItems })
            });
            if (!response.ok) {
                throw new Error('Durumlar güncellenirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Hata:', error);
            alert('Durumlar güncellenirken bir hata oluştu.');
        }
    }
});
