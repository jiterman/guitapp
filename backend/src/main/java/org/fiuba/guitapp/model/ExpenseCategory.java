package org.fiuba.guitapp.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ExpenseCategory {

    SUPERMARKET("Supermercado"),
    RESTAURANT("Restaurante"),
    CAFE("Café"),
    DELIVERY("Delivery"),
    PUBLIC_TRANSPORT("Transporte público"),
    FUEL("Combustible"),
    TAXI("Taxi/Uber"),
    UTILITIES("Servicios"),
    RENT("Alquiler"),
    HOME("Mantenimiento del hogar"),
    DOCTOR("Médico"),
    PHARMACY("Farmacia"),
    SUBSCRIPTIONS("Suscripciones"),
    OUTINGS("Salidas"),
    GYM("Gym"),
    TRAVEL("Viajes"),
    CLOTHING("Ropa"),
    EDUCATION("Educación"),
    TECHNOLOGY("Tecnología"),
    HOA_FEES("Expensas"),
    VEHICLE("Vehículo"),
    BEAUTY("Belleza"),
    PETS("Mascotas"),
    SHOPPING("Compras"),
    OTHER("Otros");

    private final String displayName;
}
