const getAllBooks = async (source) => {
    const response = await fetch(source);

    if(!response.ok){
        throw new Error(`${response.status}`);
    }
    else{
        const data = await response.json();
        return data;
    }
}

const processInfo = async () => {
    try{
        //Fetch from API
        let bookData = await getAllBooks("https://gutendex.com/books");
        let items = bookData.results;

        console.log("\nFetched items:\n");
        printItemsInArray(items); //due to some issues with browser consoles, the subjects here may appear prematurely converted to uppercase. this is not correct
    
        //Arrays - sorting by id
        let sortedItems = sortItemsByID(items);

        console.log("\n----------------------------------------\nItems after sorting by ID:\n");
        printItemsInArray(sortedItems);
    
        //Strings - capitalising subjects
        let capitalisedItems = capitaliseSubjects(sortedItems);

        console.log("\n----------------------------------------\nItems after converting subjects to uppercase:\n");
        printItemsInArray(capitalisedItems);
    
        //Dates - remove entries whose authors have been confirmed to not exist in the past 200 years
        let filteredItems = filterOldAuthors(capitalisedItems);

        console.log("\n----------------------------------------\nItems after filtering old authors:\n");
        printItemsInArray(filteredItems);
        console.log(`\nPrevious book count: ${capitalisedItems.length}\nCurrent book count: ${filteredItems.length}`)
    
        await findFyodor(bookData);
    
        await findTheodor(bookData);
    }
    catch(error){
        console.error(error);
    }
};

const sortItemsByID = (itemsToSort) => {
    itemsToSort.sort((a, b)=> a.id - b.id); //sort by id in ascending order
    return itemsToSort;
};

const capitaliseSubjects = (itemsToCapitalise) => {
    itemsToCapitalise.forEach(itemToCapitalise => {
        let tempSubjects = (itemToCapitalise.subjects).map((subject) => {
            return subject.toUpperCase();
        });
        itemToCapitalise.subjects = tempSubjects;
    });
    return itemsToCapitalise;
};

const filterOldAuthors = (itemsToFilter) => {
    let currentYear = new Date().getFullYear();
    itemsToFilter = itemsToFilter.filter((itemToFilter) => {
        for(let curr = 0; curr< (itemToFilter.authors).length ; curr++){ //for every author in the authors object. if a single author is confirmed to have last existed over 200 years ago, the entire entry will be filtered out
            if(itemToFilter.authors[curr].death_year != null){
                if(itemToFilter.authors[curr].death_year < currentYear-200){
                    return false; //they died over 200 years before the current year, so they didn't exist in the past 200 years
                }
            }
        }
        return true;
    });
    return itemsToFilter;
}

const findFyodor = async (books) => {
    let targetBook = {
        title:"Short Stories",
        author:"Dostoyevsky, Fyodor"
    }

    let foundBook = await findBook(books, targetBook);
    if(foundBook.error){
        console.log("\n"+foundBook.error_message);
    }
    else{
        console.log(`\nA book with the title "${targetBook.title}" and the author "${targetBook.author}" was found on page ${foundBook.page}:`);
        console.log(foundBook.book);
    }
}

const findTheodor = async (books) => {

    let targetBook = {
        title:"Short Stories",
        author:"Dostoyevsky, Theodor"
    }

    let foundBook = await findBook(books, targetBook);
    if(foundBook.error){
        console.log("\n"+foundBook.error_message);
    }
    else{
        console.log(`\nA book with the title "${targetBook.title}" and the author "${targetBook.author}" was found on page ${foundBook.page}:`);
        console.log(foundBook.book);
    }
}

const findBook = async (books, target) => {
    console.log(`\nSearching for the book "${target.title}" by the author "${target.author}"...`);
    let targetBookInfo;
    let morePages = true;
    let page = 1;
    while(morePages){
        //console.log(" Searching page "+page+ "...");
        let results = books.results;

        for(let currBook = 0; currBook < results.length; currBook++){
            for(let currAuthor = 0; currAuthor < ((results[currBook]).authors).length; currAuthor++){
                if(((results[currBook]).authors[currAuthor]).name == target.author && (results[currBook]).title == target.title){
                    targetBookInfo = results[currBook];
                    return { error: false, book: targetBookInfo , page: page};
                }
            }
        }

        if(books.next == null){
            return { error: true, error_message: `No book with the title "${target.title}" and the author "${target.author}" was found` }
        }
        page++;
        try{
            books = await getAllBooks(books.next);
        }
        catch(error){
            console.log("Error: "+error);
        }
    }
}

const printItemsInArray = async (itemsToPrint) => {
    for(let currentItem = 0; currentItem<itemsToPrint.length; currentItem++){
        console.log(itemsToPrint[currentItem]);
    }
}

processInfo();