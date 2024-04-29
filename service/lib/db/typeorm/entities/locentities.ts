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

@Entity({ name: "regions" })
export class Region {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column("text", { nullable: true })
    translations: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column()
    flag: number;

    @Column()
    wikiDataId: string;

}


@Entity({ name: "subregions" })
export class Subregion {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column("text", { nullable: true })
    translations: string;

    @Column()
    region_id: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column()
    flag: number;

    @Column()
    wikiDataId: string;


}

@Entity({ name: "countries" })
export class Country {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column()
    iso3: string;

    @Column()
    numeric_code: string;

    @Column()
    iso2: string;

    @Column()
    phonecode: string;

    @Column()
    capital: string;

    @Column()
    currency: string;

    @Column()
    currency_name: string;

    @Column()
    currency_symbol: string;

    @Column()
    tld: string;

    @Column({nullable:true})
    native: string;

    @Column()
    region: string;

    @Column()
    region_id: number;

    @Column()
    subregion: string;

    @Column()
    subregion_id: number;

    @Column()
    nationality: string;

    @Column("text", { nullable: true })
    timezones: string;

    @Column("text", { nullable: true })
    translations: string;

    @Column()
    latitude: number;

    @Column()
    longitude: number;

    @Column()
    emoji: string;

    @Column()
    emojiU: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column()
    flag: number;

    @Column({ nullable: true })
    wikiDataId: string;

}

@Entity({ name: "states" })
export class State {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column()
    country_id: number;

    @Column()
    country_code: string;

    @Column({ nullable: true })
    fips_code: string;

    @Column()
    iso2: string;

    @Column()
    type: string;

    @Column()
    latitude: number;

    @Column()
    longitude: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column()
    flag: number;

    @Column({ nullable: true })
    wikiDataId: string;

   
}

@Entity({ name: "cities" })
export class City {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column()
    state_id: number;

    @Column()
    state_code: string;

    @Column()
    country_id: number;

    @Column()
    country_code: string;

    @Column()
    latitude: number;

    @Column()
    longitude: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column()
    flag: number;

    @Column()
    wikiDataId: string;

}
