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
    //Fetch from API
    try{
        let bookData = await getAllBooks("https://gutendex.com/books");
        let items = bookData.results;
    
        //Arrays - sorting by id
        items = sortItemsByID(items);
    
        //Strings - capitalising subjects
        items = capitaliseSubjects(items);
    
        //Dates - remove entries whose authors have been confirmed to not exist in the past 200 years
        items = filterOldAuthors(items);
    
        console.log("fetched items after being sorted by ID, having their subjects converted to uppercase and entries with authors that havent existed in the last 200 years removed:");
        for(let currentItem = 0; currentItem<items.length; currentItem++){ //printed like this because printing the whole array doesnt show the contents of the objects
            console.log(items[currentItem]);
            console.log(",");
        }
    
        await findFyodor(bookData);
    
        await findTheodor(bookData);
    }
    catch(error){
        console.error(error);
    }
};

const sortItemsByID = (items) => {
    items.sort((a, b)=> a.id - b.id);
    return items;
};

const capitaliseSubjects = (items) => {
    items.forEach(item => {
        let tempSubjects = (item.subjects).map((subject) => {
            return subject.toUpperCase();
        });
        item.subjects = tempSubjects;
    });
    return items;
};

const filterOldAuthors = (items) => {
    let currentYear = new Date().getFullYear();
    items = items.filter((item) => {
        for(let curr = 0; curr< (item.authors).length ; curr++){ //for every author in the authors object. if a single author is confirmed to have last existed over 200 years ago, the entire entry will be filtered out
            //if we want to filter out authors with no confirmed birth or death dates, uncomment the below if statement
            /*if(item.authors[curr].death_year == null && (item.authors[curr].birth_year == null || item.authors[curr].birth_year < currentYear-200)){
                return false;
            }*/ 
            if(item.authors[curr].death_year != null){
                if(item.authors[curr].death_year < currentYear-200){
                    return false; //they died over 200 years before the current year, so they didn't exist in the past 200 years
                }
            }
        }
        return true;
    });
    return items;
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
    console.log(`\nSearching for the book "${target.title}" by the author "${target.author}"`);
    let targetBookInfo;
    let morePages = true;
    let page = 1;
    while(morePages){
        //console.log(" Searching page "+page+ "...");
        let items = books.results;

        for(let currBook = 0; currBook < items.length; currBook++){
            for(let currAuthor = 0; currAuthor < ((items[currBook]).authors).length; currAuthor++){
                if(((items[currBook]).authors[currAuthor]).name == target.author && (items[currBook]).title == target.title){
                    targetBookInfo = items[currBook];
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

processInfo();