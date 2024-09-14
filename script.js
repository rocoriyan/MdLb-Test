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

getAllBooks();