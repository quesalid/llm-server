import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    ManyToMany,
    OneToMany,
    ManyToOne,
    JoinTable
} from "typeorm"

//import { Profprofile } from "./altentities.js"

@Entity({name: "persprofile" })
export class Persprofile {
    @PrimaryColumn("uuid")
    uid: string

    @Column()
    name: string

    @Column()
    surname: string

    @Column({ nullable: true, default: '' })
    statement: string

    @Column({ nullable: true, default: 'en' })
    language: string

    @Column({ nullable: true,default:false })
    nlsubscription: boolean

    @Column({ nullable: true,default:false })
    ppolicy: boolean

    @Column({ nullable: true, default: 'AGENDER' })
    gender: string

    @Column("mediumtext",{ nullable: true })
    image: string

    @Column({ nullable: true })
    address: string

    @Column({ nullable: true })
    city: string

    @Column({ nullable: true })
    state: string

    @Column({ nullable: true })
    region: string

    @Column({ nullable: true })
    country: string

    @Column({ nullable: true })
    zip: string

    @Column({ nullable: true })
    bcountry: string

    @Column({ nullable: true })
    bstate: string

    @Column({ nullable: true })
    bprovince: string

    @Column({ nullable: true })
    bcity: string

    @Column({ nullable: true })
    bdate: string

    @Column({ nullable: true })
    idnumber: string

    @Column({ nullable: true })
    idtype: string

    @Column({ nullable: true })
    idvalidity: string

    @Column({ nullable: true })
    mobile: string

    @Column({ nullable: true })
    otherphone: string

    @Column({ nullable: true })
    linkedin: string

    @Column({ nullable: true })
    facebook: string

    @Column({ nullable: true })
    twitter: string

    @Column({ nullable: true })
    instagram: string

    @Column({ nullable: true })
    skype: string

    @Column({ nullable: true })
    whatsapp: string

    @Column({ nullable: true })
    telegram: string

    @Column({ nullable: true })
    othersocial: string

    @Column({ nullable: true })
    owner: string

    @OneToOne(() => Profprofile, (profprofile) => profprofile.persprofile, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn()
    profprofile: Promise<Profprofile>

    @ManyToMany(() => Group, (group) => group.profiles, {cascade: true, onDelete: 'CASCADE', createForeignKeyConstraints: false })
    groups: Promise<Group[]>


    @ManyToMany(() => Company, (company) => company.profiles, { cascade: true, onDelete: 'CASCADE', createForeignKeyConstraints: false })
    companies: Promise<Company[]>

    @ManyToMany(() => New, (_new) => _new.profiles)
    @JoinTable()
    news: Promise<New[]>

    @ManyToMany(() => Event, (event) => event.profiles, { cascade: true, onDelete: 'CASCADE', createForeignKeyConstraints: false })
    events: Promise<Event[]>

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date


}

@Entity({ name: "profprofile" })
export class Profprofile {
    @PrimaryColumn("uuid")
    uid: string

    @Column("text", { nullable: true })
    shortbio: string

    @Column("simple-array", { nullable: true })
    sectors: string[]

    @Column("simple-array", { nullable: true })
    skills: string[]

    @Column("simple-array", { nullable: true })
    languages: string[]

    @Column("text", { nullable: true })
    education: string

    @Column("text", { nullable: true })
    profexp1: string

    @Column("text", { nullable: true })
    profexp2: string

    @Column("text", { nullable: true })
    profexp3: string

    @Column({ nullable: true })
    website: string

    @Column({ nullable: true })
    owner: string

    @Column({ nullable: true })
    profession: string

    @Column({ nullable: true })
    taxcode: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @OneToOne(() => Persprofile, (persprofile) => persprofile.profprofile)
    persprofile: Persprofile;

}


@Entity({name: "group" })
export class Group {
    @PrimaryGeneratedColumn("uuid")
    uid: string;

    @Column()
    name: string

    @Column({ nullable: true, default: 'USER' })
    type: string

    @Column({ nullable: true})
    description: string

    @Column("simple-array", { nullable: true })
    tags: string[]

    @Column({ nullable: true })
    owner: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToMany(() => Persprofile, (profile) => profile.groups)
    @JoinTable()
    profiles: Promise<Persprofile[]>

    @ManyToMany(() => New, (_new) => _new.groups)
    @JoinTable()
    news: Promise<New[]>

    @ManyToMany(() => Event, (event) => event.groups)
    @JoinTable()
    events: Promise<Event[]>
}

@Entity({name: "new"})
export class New {
    @PrimaryGeneratedColumn("uuid")
    uid: string;

    @Column("text")
    title: string

    @Column("text",{ nullable: true })
    subtitle: string

    @Column("text",{ nullable: true })
    text: string

    @Column({ nullable: true })
    html: string

    @Column("simple-array", { nullable: true })
    tags: string[]

    @Column("simple-array", { nullable: true })
    links: string[]

    @Column({ nullable: true })
    published: Date

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToMany(() => Persprofile, (profile) => profile.news, { cascade: true, onDelete: 'CASCADE', createForeignKeyConstraints: false })
    profiles: Promise<Persprofile[]>

    @ManyToMany(() => Group, (group) => group.news, { cascade: true, onDelete: 'CASCADE', createForeignKeyConstraints: false })
    groups: Promise<Group[]>

    @OneToMany(type => NewTrans, (newtrans) => newtrans.origin)
    translations: NewTrans[];
}

@Entity({ name: "newtrans" })
export class NewTrans {
    @PrimaryGeneratedColumn("uuid")
    uid: string;

    @Column()
    author: string

    @Column("text")
    title: string

    @Column("text", { nullable: true })
    subtitle: string

    @Column("text", { nullable: true })
    text: string

    @Column({ nullable: true, default: 'en' })
    language: string

    @Column({ nullable: true })
    published: Date

    @ManyToOne(() => New, (n) => n.translations, { cascade: true, onDelete: 'CASCADE', createForeignKeyConstraints: true })
    origin: New

}

@Entity({name: "event" })
export class Event {
    @PrimaryGeneratedColumn("uuid")
    uid: string;

    @Column("simple-array", { nullable: true })
    start: number[]

    @Column({ nullable: true, default:'local' })
    startInputType: string

    @Column({ nullable: true, default: 'utc' })
    startOutputType: string

    @Column("simple-json", { nullable: true})
    duration: { days: number, hours: number, minutes: number }

    @Column("text")
    title: string

    @Column('text',{ nullable: true })
    description: string

    @Column({ nullable: true })
    location: string

    @Column({ nullable: true })
    url: string

    @Column("simple-json", { nullable: true })
    geo: { lat: number, lon: number }

    @Column("simple-array", { nullable: true })
    categories: string[]

    @Column({ nullable: true, default: 'TENTATIVE' })
    status: string

    @Column({ nullable: true, default: 'TENTATIVE' })
    busyStatus: string

    @Column("simple-json", { nullable: true })
    organizer: { name: string, email: string, dir: string, sentBy: string }

    @Column("simple-array",{ nullable: true })
    attendees: string[]

    @Column("simple-json", { nullable: true })
    alarms: { action: string, description: string, trigger: string } 

    @Column({ nullable: true, default: 'PUBLIC' })
    classification: string

    @Column({ nullable: true })
    calName: string

    @Column({ nullable: true, default: 'PUBLISH'})
    method: string

    @Column({ nullable: true, default: 'marscalendar/ics' })
    productId: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToMany(() => Persprofile, (profile) => profile.events)
    @JoinTable()
    profiles: Promise<Persprofile[]>

    @ManyToMany(() => Group, (group) => group.events, { cascade: true, onDelete: 'CASCADE', createForeignKeyConstraints: false })
    groups: Promise<Group[]>

    @OneToMany(type => EventTrans, (eventtrans) => eventtrans.origin)
    translations: EventTrans[];
}

@Entity({ name: "eventtrans" })
export class EventTrans {
    @PrimaryGeneratedColumn("uuid")
    uid: string;

    @Column()
    author: string

    @Column("text")
    title: string

    @Column('text', { nullable: true })
    description: string

    @Column({ nullable: true, default: 'en' })
    language: string

    @Column({ nullable: true })
    published: Date

    @ManyToOne(() => Event, (ev) => ev.translations, { cascade: true, onDelete: 'CASCADE', createForeignKeyConstraints: true })
    origin: Event
}

@Entity({name: "message" })
export class Message {
    @PrimaryGeneratedColumn("uuid")
    uid: string;

    @Column()
    to: string

    @Column()
    subject: string

    @Column("text",{ nullable: true })
    txt: string

    @Column("text",{ nullable: true })
    html: string

    @Column("text",{ nullable: true })
    attachments: string

    @Column("simple-json", { nullable: true })
    list: { help: string, unsubscribe: string, id: string } 

    @Column({ nullable: true,default:false})
    sent: boolean

    @Column({ nullable: true })
    date: Date

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}



@Entity({name: "company" })
export class Company {
    @PrimaryGeneratedColumn("uuid")
    uid: string;

    @Column()
    name: string

    @Column("simple-array", { nullable: true })
    sectors: string[]

    @Column({ nullable: true })
    country: string

    @Column({ nullable: true })
    state: string

    @Column({ nullable: true })
    province: string

    @Column({ nullable: true })
    city: string

    @Column({ nullable: true })
    address: string

    @Column({ nullable: true })
    zip: string

    @Column({ nullable: true })
    startdate: string

    @Column({ nullable: true })
    uoc: string

    @Column({ nullable: true })
    uoctype: string

    @Column({ nullable: true })
    taxcode: string

    @Column({ nullable: true })
    vatcode: string

    @Column({ nullable: true })
    website: string

    @Column("text",{ nullable: true })
    note: string

    @Column({ nullable: true })
    owner: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToMany(() => Persprofile, (profile) => profile.companies)
    @JoinTable()
    profiles: Promise<Persprofile[]>
}