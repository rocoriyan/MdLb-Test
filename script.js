const getAllBooks = async () => {
    const response = await fetch("https://gutendex.com/books");

    if(!response.ok){
        throw new Error(`${response.error}`);
    }
    else{
        const data = await response.json();
        return data;
    }
}

const processInfo = async () => {
    const bookData = await getAllBooks();
    const items = bookData.results;
    items.sort((a, b)=> a.id - b.id); //sorting by id

    items.forEach(item => { //capitalising subjects
        let tempSubjects = (item.subjects).map((subject) => {
            return subject.toUpperCase();
        });
        item.subjects = tempSubjects;
    });
};

processInfo();