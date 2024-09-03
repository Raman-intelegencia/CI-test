import { Message, Profiles, Threads, Users, loadLatestMessage } from "@amsconnect/shared";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { UserProfileService } from "./user-profile.service";
import { thread } from "../../models/profile.model";
import { ThreadHelperService } from "./thread-helper.service";
import { SelectedThreadHelperService } from "./selected-thread-helper.service";

@Injectable({
    providedIn: "root",
})
export class InboxHelperService {
    private maxJournalIdSource = new BehaviorSubject<number>(0);
    public maxJournalId$ = this.maxJournalIdSource.asObservable();

    public threadsSource = new BehaviorSubject<Threads[]>([]);
    public threads$ = this.threadsSource.asObservable();

    private profilesSource = new BehaviorSubject<Profiles[]>([]);
    public profiles$ = this.profilesSource.asObservable();

    private userSource = new BehaviorSubject<Users | null>(null);
    public user$ = this.userSource.asObservable();

    private unreadCountersSource = new BehaviorSubject<number>(0);
    public unreadCounters$ = this.unreadCountersSource.asObservable();

    private journalEntriesSource = new BehaviorSubject<any[]>([]);
    public journalEntries$ = this.journalEntriesSource.asObservable();

    public isThreadsDataFetched = false;
    public isLoadOlderThreadsDataFetched = false;

    constructor(private userProfileSvc: UserProfileService,
        private threadHealperSvc: ThreadHelperService,private selectedThreadService:SelectedThreadHelperService) { }

        public fetchThreadsAndProfiles(archive:boolean, checkBoxValue?:any): void {
            // checks flag for successful api call
            if(this.isThreadsDataFetched){
                return;
            }
            this.selectedThreadService.setFlagToClearInputField(true);
            const journalId =checkBoxValue ? 0 : this.maxJournalIdSource.getValue();
            this.isThreadsDataFetched = true;
            this.userProfileSvc
                .getMessageload_latest2(journalId, this.threadHealperSvc.getArchiveCheckboxState())
                .subscribe((data: loadLatestMessage) => {
                    if(data.status !== 'error'){
                    if (data.flush_local === 1) {
                        this.maxJournalIdSource.next(0);
                        this.threadsSource.next([]);
                        this.profilesSource.next([]);
                    }
    
                    // Mark each current thread with a flag
                    const currentThreadsWithFlag = data.threads.map(thread => {
                        return { ...thread, isOlderThread: false };
                     });
                    // Use the merge methods to properly combine the new data with existing data
                    const mergedThreads = this.mergeThreads(
                        this.threadsSource.getValue(),
                        currentThreadsWithFlag
                    );
                    const mergedProfiles = this.mergeProfiles(
                        this.profilesSource.getValue(),
                        data.profiles
                    );
    
                    this.threadsSource.next(mergedThreads);
                    this.profilesSource.next(mergedProfiles);
    
                    // Update current user profile
                    if (data.user) {
                        const currentUser = this.userSource.getValue();
                        const updatedUser = { ...currentUser, ...data.user };
                        this.userSource.next(updatedUser);
                    }
                    // Add journal entries one by one
                    if (data.entries.length) {
                        // Separate message entries and other types of entries
                        const messageEntries = data.entries.filter(entry => entry.type === 'message');
                        const otherEntries = data.entries.filter(entry => entry.type !== 'message');
                        // Sort only the message entries in reverse order based on 'seq'
                        messageEntries.sort((a, b) => a.message.seq - b.message.seq);
                        // Combine the sorted message entries with the other entries
                        const sortedEntries = messageEntries.concat(otherEntries);
                        
                        const entries = this.journalEntriesSource.getValue();
                        sortedEntries.forEach((entry: any) => {
                            if (entry.type === "message") {
                                // entries.push(this.parseMessageEntry(entry.message));
                                this.handleMessageEntries(entry.message);
                            } else if (entry.type === "mro") {
                                // handle read receipts
                                // this.handleReadReceipt(entry.um);
                            } else if (entry.type === "mr") {
                                // entries.push(this.parseMessageReadEntry(entry));
                            } else {
                                // entries.push(this.parseJournalEntry(entry));
                            }
                        });
                        this.journalEntriesSource.next(entries);
                    }
    
                    // Update unread message counters
                    if (data.counters_unread) {
                        this.unreadCountersSource.next(data.counters_unread.msg);
                    }
                    // reset the flag to false after successful api call
                    this.isThreadsDataFetched = false;
                    // check if the journalId is greater than the existing journalId then call the api again
                    if(data.max_journal_id > this.maxJournalIdSource.getValue()){
                        this.maxJournalIdSource.next(data.max_journal_id);
                        this.fetchThreadsAndProfiles(archive);
                    }
                    // Update the maxJournalId after merging
                    // this.clientDataSetManagerSvc.updateClientDataSet();
                    // if(this.maxJournalIdSource.val)
                }else{
                    //log error    
                   console.error('Error occured in loadlatest api call');
                }
                });
        }
    

    public handleMessageEntries(message: Message):void {
        const threads = this.threadsSource.getValue();
        
        const threadId = message.thread_id.$oid;
        // Find the index of the thread that the message belongs to.
        const threadIndex = threads.findIndex(
            (thread) => thread._id.$oid === threadId
        );

        if (threadIndex > -1) {
            // Get the thread from the threads array.
            const threadToUpdate = threads[threadIndex];
            // Find the index of the message if it already exists in the thread.
            const messageIndex = threadToUpdate.messages.findIndex(
                (m) => m._id.$oid === message._id.$oid
            );

            if (messageIndex > -1) {
                // Update existing message.
                threadToUpdate.messages[messageIndex] = {
                    ...threadToUpdate.messages[messageIndex],
                    ...message,
                };
            } else {
                // Add new message to the thread at the start of messages array.
                threadToUpdate.messages.unshift(message);
            }
            // Now update the thread in the threads array.
            threads.splice(threadIndex, 1);
            threads.unshift(threadToUpdate);
            // Emit the updated threads array.
            this.threadsSource.next(threads);
        } else {
            // If the thread isn't found, you might want to handle this case as well.
            // Perhaps by fetching the thread or by creating a new thread.
            console.warn(`Thread with ID ${threadId} not found.`);
        }
    }

    // Method to fetch and merge older threads
    public fetchAndMergeOlderThreads(
        archived: boolean,
        interactive: boolean,
        onComplete: () => void
    ): void {
        const currentThreads = this.threadsSource.getValue();
        const curretnProfiles = this.profilesSource.getValue();
        const lastThread = currentThreads[currentThreads.length - 1];

        if (lastThread) {
            const lastThreadTimeUpdated = lastThread.time_updated.$date; // Replace with your actual property

            if(this.isLoadOlderThreadsDataFetched){
                return;
            }

            this.isLoadOlderThreadsDataFetched = true;
            this.userProfileSvc
                .getMessage_load_older_threads(
                    lastThreadTimeUpdated.toString(),
                    archived,
                    interactive
                )
                .subscribe({
                    next: (olderThreadsData) => {
                        // Mark each older thread with a flag
                        const olderThreadsWithFlag = olderThreadsData.threads.map((thread:thread) => {
                            return { ...thread, isOlderThread: true };
                        });
                        // Merge the older threads with the current threads
                        let updatedThreadArr = [];
                        updatedThreadArr = [...currentThreads, ...olderThreadsWithFlag];                        
                        this.threadsSource.next(updatedThreadArr);
                        // If there are profiles in the response, merge them as well
                        if (olderThreadsData.profiles) {
                            const mergedProfiles = this.mergeProfiles(
                                curretnProfiles,
                                olderThreadsData.profiles
                            );
                            this.profilesSource.next(mergedProfiles);
                        }
                        this.isLoadOlderThreadsDataFetched = false;
                    },
                    error: (error) => {
                        // Handle error scenario
                        console.error("Failed to fetch older threads:", error);
                    },
                    complete: () => {
                        onComplete(); // Call onComplete when done
                    }
                });
        }
    }

    private mergeThreads(
        currentThreads: Threads[],
        newThreads: Threads[]
    ): Threads[] {
        const updatedThreads = [...currentThreads]; // Create a copy to avoid mutating the original array
        newThreads.forEach((newThread) => {
            // Ensure newThread has a 'type' key, set to 'peer_to_peer' if not present
        const threadWithDefaultType = {
            ...newThread,
            type: newThread.type || 'peer_to_peer'
        };
    
            const index = updatedThreads.findIndex(
                (t) => t._id.$oid === threadWithDefaultType._id.$oid
            );
            if (index > -1) {
                // Parse new thread data if necessary, then merge
                const parsedThread = this.parseThread(threadWithDefaultType);
                // Conditional logic for 'visibility' and 'muted' keys as before
                if (!('visibility' in parsedThread)) {
                    delete updatedThreads[index].visibility;
                }
                if (!('muted' in parsedThread)) {
                    delete updatedThreads[index].muted;
                }
                updatedThreads[index] = { ...updatedThreads[index], ...parsedThread };
            } else {
                // New thread, add it with messages array only if it doesn't have one
                const threadWithMessages = this.parseThread(threadWithDefaultType);
                if (!threadWithMessages.messages) {
                    threadWithMessages.messages = [];
                }
                // Condition for pushing or unshifting based on maxJournalIdSource
                this.maxJournalIdSource.getValue() === 0 ? updatedThreads.push(threadWithMessages) : updatedThreads.unshift(threadWithMessages);
            }
        });
        return updatedThreads;
    }
    

    private parseThread(thread: Threads): Threads {
        // Perform any necessary transformation or parsing
        // This is just a placeholder - actual parsing logic will depend on your specific needs
        return thread;
    }

    private mergeProfiles(
        currentProfiles: Profiles[],
        newProfiles: Profiles[]
    ): Profiles[] {
        const updatedProfiles = [...currentProfiles]; // Create a copy to avoid mutating the original array
        newProfiles.forEach((newProfile) => {
            const index = updatedProfiles.findIndex(
                (p) => p._id.$oid === newProfile._id.$oid
            );
            if (index > -1) {
                // Parse new profile data if necessary, then merge
                const parsedProfile = this.parseProfile(newProfile);
                updatedProfiles[index] = {
                    ...updatedProfiles[index],
                    ...parsedProfile,
                };
            } else {
                // Parse and add the new profile if it doesn't exist already
                updatedProfiles.push(this.parseProfile(newProfile));
            }
        });

        return updatedProfiles;
    }

    private parseProfile(profile: Profiles): Profiles {
        // Perform any necessary transformation or parsing
        // This is just a placeholder - actual parsing logic will depend on your specific needs
        return profile;
    }
}