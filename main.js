let lastCurrentId = 0;

async function LoadData() {
    try {
        let res = await fetch("http://localhost:3000/posts");
        let posts = await res.json();
        let body = document.getElementById("body_table");
        body.innerHTML = '';

        // Tìm ID lớn nhất thực tế từ server để tránh trùng lặp khi Add
        if (posts.length > 0) {
            lastCurrentId = Math.max(...posts.map(post => Number(post.id)));
        }

        for (const post of posts) {
            let isDeletedClass = post.isDeleted ? "strikethrough" : "";
            
            body.innerHTML += `<tr>
                <td class="${isDeletedClass}">${post.id}</td>
                <td class="${isDeletedClass}">${post.title}</td>
                <td class="${isDeletedClass}">${post.views}</td>
                <td>
                    <input type="button" value="Delete" onclick="Delete('${post.id}')"/>
                </td>
            </tr>`;
        }
    } catch (error) {
        console.error("Lỗi LoadData:", error);
    }
}

async function Save() {
    // 1. Lấy giá trị từ các ô input
    let inputId = document.getElementById("id_txt").value.trim();
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("view_txt").value;

    try {
        if (inputId !== "") {
            // --- TRƯỜNG HỢP 1: CÓ ID -> CẬP NHẬT (PUT) ---
            let res = await fetch('http://localhost:3000/posts/' + inputId, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title,
                    views: Number(views),
                    isDeleted: false // Reset trạng thái xóa khi cập nhật
                })
            });

            if (res.ok) {
                alert("Cập nhật bài viết " + inputId + " thành công!");
            } else {
                alert("Không tìm thấy ID này để cập nhật!");
            }

        } else {
            // --- TRƯỜNG HỢP 2: KHÔNG CÓ ID -> TẠO MỚI (POST) ---
            lastCurrentId++; 
            let res = await fetch('http://localhost:3000/posts', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: String(lastCurrentId),
                    title: title,
                    views: Number(views),
                    isDeleted: false
                })
            });

            if (res.ok) {
                alert("Thêm mới thành công bài viết ID: " + lastCurrentId);
            }
        }

        // 2. Xóa sạch form sau khi lưu thành công
        document.getElementById("id_txt").value = "";
        document.getElementById("title_txt").value = "";
        document.getElementById("view_txt").value = "";

        // 3. Load lại bảng dữ liệu
        await LoadData();

    } catch (error) {
        console.error("Lỗi trong quá trình Save:", error);
    }
}

async function Delete(id) {
    if (confirm("Bạn có chắc muốn xóa bài viết này?")) {
        try {
            await fetch('http://localhost:3000/posts/' + id, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isDeleted: true })
            });
            await LoadData();
        } catch (error) {
            console.error("Lỗi Delete:", error);
        }
    }
}

// Khởi tạo
LoadData();


let lastCommentId = 0;

// 1. Hàm Load dữ liệu Comments
async function LoadComments() {
    let res = await fetch("http://localhost:3000/comments");
    let comments = await res.json();
    let body = document.getElementById("body_comments");
    body.innerHTML = '';

    for (const c of comments) {
        // Cập nhật ID lớn nhất hiện tại
        lastCommentId = Number(c.id);

        // Kiểm tra trạng thái isDeleted để gạch ngang
        let strikeClass = c.isDeleted ? "strikethrough" : "";
        
        body.innerHTML += `<tr>
            <td class="${strikeClass}">${c.id}</td>
            <td class="${strikeClass}">${c.text}</td>
            <td class="${strikeClass}">${c.postId}</td>
            <td>
                <input type="button" value="Delete" onclick="DeleteComment('${c.id}')"/>
            </td>
        </tr>`;
    }
}

// 2. Hàm Lưu (Thêm mới hoặc Cập nhật)
async function SaveComment() {
    let idUpdate = document.getElementById("comment_id_input").value;
    let text = document.getElementById("comment_text_txt").value;
    let postId = document.getElementById("comment_postId_txt").value;

    // Kiểm tra xem ID đã tồn tại chưa
    let checkExist = await fetch('http://localhost:3000/comments/' + idUpdate);

    if (checkExist.ok && idUpdate !== "") {
        // --- LOGIC UPDATE (PUT) ---
        await fetch('http://localhost:3000/comments/' + idUpdate, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: text,
                postId: postId,
                isDeleted: false
            })
        });
        console.log("Update comment thành công");
    } else {
        // --- LOGIC ADD NEW (POST) ---
        lastCommentId++; // Tự động tăng ID
        await fetch('http://localhost:3000/comments', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: String(lastCommentId),
                text: text,
                postId: postId,
                isDeleted: false
            })
        });
        console.log("Thêm comment mới thành công");
    }
    LoadComments(); // Load lại bảng
}

// 3. Hàm Xóa giả (Soft Delete)
async function DeleteComment(id) {
    let res = await fetch('http://localhost:3000/comments/' + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            isDeleted: true
        })
    });
    if (res.ok) {
        console.log("Đã xóa comment: " + id);
        LoadComments();
    }
}

// Gọi hàm Load khi trang web mở lên
LoadComments();