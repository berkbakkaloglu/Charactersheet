document.addEventListener('DOMContentLoaded', () => {
    // Haber ekleme
    document.getElementById('add-news-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            const response = await fetch('/api/news', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Haber eklerken bir hata oluştu');
        }
    });

    // Haber silme
    document.querySelectorAll('.delete-news-button').forEach(button => {
        button.addEventListener('click', async () => {
            const newsId = button.dataset.id;
            try {
                const response = await fetch(`/api/news/${newsId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    window.location.reload();
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Haber silerken bir hata oluştu');
            }
        });
    });

    // Avatar yükleme
    document.getElementById('upload-avatar-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const characterId = e.target.dataset.id;
        try {
            const response = await fetch(`/api/characters/${characterId}/avatar`, {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Avatar yüklerken bir hata oluştu');
        }
    });

    // Diğer güncellemeler
    // Stat güncelleme
    document.getElementById('update-stats-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        const characterId = e.target.dataset.id;
        try {
            const response = await fetch(`/api/characters/${characterId}/stats`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Stat güncellerken bir hata oluştu');
        }
    });

    // Envanter güncelleme
    document.getElementById('update-inventory-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        const characterId = e.target.dataset.id;
        try {
            const response = await fetch(`/api/characters/${characterId}/inventory`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Envanter güncellerken bir hata oluştu');
        }
    });

    // Büyü güncelleme
    document.getElementById('update-spells-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        const characterId = e.target.dataset.id;
        try {
            const response = await fetch(`/api/characters/${characterId}/spells`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Büyü güncellerken bir hata oluştu');
        }
    });

    // Durum güncelleme
    document.getElementById('update-conditions-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        const characterId = e.target.dataset.id;
        try {
            const response = await fetch(`/api/characters/${characterId}/conditions`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Durum güncellerken bir hata oluştu');
        }
    });

    // Özgeçmiş güncelleme
    document.getElementById('update-biography-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        const characterId = e.target.dataset.id;
        try {
            const response = await fetch(`/api/characters/${characterId}/biography`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Özgeçmiş güncellerken bir hata oluştu');
        }
    });
});
