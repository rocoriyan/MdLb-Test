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
    
        await findFyodor(bookData); //first I am searching for "Short Stories" by "Dostoyevsky, Fyodor", as this is in the database and we'll get an answer within a reasonable amount of time
    
        await findTheodor(bookData); //next I am searching for "Short Stories" by "Dostoyevsky, Theodor", as this is the name requested to be searched for but will take a long time to determine that it's not there (there are many pages)
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

const filterOldAuthors = (itemsToFilter) => { // I've assumed that this means to filter out any books with any authors confirmed to not have existed in the past 200 years (e.g. we know they died over 200 years ago). I don't filter out books with authors with blank death years. I do exclude books if the have even 1 author that died before 200 years ago, evem if other authors of that book lived beyond that.
    let currentYear = new Date().getFullYear(); //get the current year so this program doesnt become outdated in 1 year
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